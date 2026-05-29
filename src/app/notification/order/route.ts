import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { LaundryStatus, PaymentStatus } from '@/types/enums';
import { MidtransNotificationResponse } from '@/types/midtrans';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body: MidtransNotificationResponse = await req.json();

    const { 
      order_id, 
      status_code, 
      gross_amount, 
      signature_key, 
      transaction_status, 
      fraud_status 
    } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    
    // Verifikasi Signature Key Midtrans untuk keamanan
    const hash = crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex');
    
    if (hash !== signature_key) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let isSuccess = false;

    if (transaction_status == 'capture') {
      if (fraud_status == 'accept') {
        isSuccess = true;
      }
    } else if (transaction_status == 'settlement') {
      isSuccess = true;
    }

    // Ekstrak invoice_no dari order_id midtrans
    // midtrans order_id formatnya: INV-YYYYMMDD-XXXX-TIMESTAMP
    const invoiceNo = order_id.split('-').slice(0, 3).join('-');

    // Dapatkan internal order_id terlebih dahulu
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select('id, total_amount, paid_amount, laundry_status')
      .eq('invoice_no', invoiceNo)
      .single();

    if (fetchError || !orderData) {
      console.error('Order not found for webhook:', fetchError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Cari payment yang sesuai untuk mencegah double update
    const { data: payments } = await supabase
      .from('order_payments')
      .select('*')
      .eq('order_id', orderData.id)
      .eq('payment_type', 'NON_TUNAI')
      .eq('amount', parseFloat(gross_amount))
      .order('created_at', { ascending: false });

    const targetPayment = payments && payments.length > 0 ? payments[0] : null;

    if (targetPayment) {
      if (targetPayment.midtrans_status === 'settlement' || targetPayment.midtrans_status === 'capture') {
        // Sudah diproses sebelumnya, abaikan untuk mencegah double hit
        return NextResponse.json({ status: 'OK', message: 'Already processed' });
      }
      
      // Update status di order_payments ini saja
      await supabase
        .from('order_payments')
        .update({ midtrans_status: transaction_status })
        .eq('id', targetPayment.id);
    } else {
      // Fallback jika tidak menemukan payment yang pas
      await supabase
        .from('order_payments')
        .update({ midtrans_status: transaction_status })
        .eq('order_id', orderData.id)
        .eq('payment_type', 'NON_TUNAI')
        .eq('amount', parseFloat(gross_amount));
    }

    // Jika pembayarannya lunas (berhasil), barulah update tabel orders utama
    if (isSuccess) {
      const newPaidAmount = (orderData.paid_amount || 0) + parseFloat(gross_amount);
      const newRemaining = Math.max(0, orderData.total_amount - newPaidAmount);
      
      const newPaymentStatus = newRemaining > 0 ? PaymentStatus.DP : PaymentStatus.PAID;
      const newLaundryStatus = orderData.laundry_status === LaundryStatus.WAITING_PAYMENT 
          ? LaundryStatus.PROCESS 
          : orderData.laundry_status;

      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: newPaymentStatus,
          laundry_status: newLaundryStatus,
          paid_amount: newPaidAmount,
          remaining_amount: newRemaining
        })
        .eq('id', orderData.id);

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
