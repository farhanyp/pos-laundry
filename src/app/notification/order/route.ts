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

    let paymentStatus: PaymentStatus | null = null;
    let laundryStatus: LaundryStatus | null = null;

    if (transaction_status == 'capture') {
      if (fraud_status == 'accept') {
        paymentStatus = PaymentStatus.PAID;
        laundryStatus = LaundryStatus.PROCESS;
      }
    } else if (transaction_status == 'settlement') {
      paymentStatus = PaymentStatus.PAID;
      laundryStatus = LaundryStatus.PROCESS;
    } else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire') {
      // paymentStatus = PaymentStatus.FAILED; // Jika Anda punya status gagal
    } else if (transaction_status == 'pending') {
      // paymentStatus = PaymentStatus.UNPAID;
    }

    if (paymentStatus === PaymentStatus.PAID && laundryStatus === LaundryStatus.PROCESS) {
      // Ekstrak invoice_no dari order_id midtrans
      // midtrans order_id formatnya: INV-YYYYMMDD-XXXX-TIMESTAMP
      const invoiceNo = order_id.split('-').slice(0, 3).join('-');

      // Update tabel orders
      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          laundry_status: laundryStatus,
          paid_amount: parseFloat(gross_amount),
          remaining_amount: 0
        })
        .eq('invoice_no', invoiceNo)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
      }

      if (data?.id) {
        // Update tabel order_payments juga agar midtrans_status berubah
        await supabase
          .from('order_payments')
          .update({
            midtrans_status: transaction_status
          })
          .eq('order_id', data.id)
          .is('payment_type', 'NON_TUNAI');
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
