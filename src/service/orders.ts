import { createClient } from '@/lib/supabase/client';
import { OrderPayload, OrderWithDetails } from '@/types/order';
import { LaundryStatus, PaymentStatus } from '@/types/enums';

export const getOrders = async (): Promise<OrderWithDetails[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (*),
      order_items (
        *,
        services (*)
      ),
      order_payments (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data as unknown as OrderWithDetails[];
};

export const createOrderTransaction = async (payload: OrderPayload): Promise<void> => {
  const supabase = createClient();
  
  let finalCustomerId = payload.customer_id;

  // 1. Insert New Customer if needed
  if (!finalCustomerId && payload.new_customer) {
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert([{
        name: payload.new_customer.name,
        whatsapp_no: payload.new_customer.whatsapp_no,
        address: payload.new_customer.address
      }])
      .select('id')
      .single();
      
    if (customerError) throw new Error(`Customer Error: ${customerError.message}`);
    finalCustomerId = newCustomer.id;
  }

  if (!finalCustomerId) throw new Error("Customer is required");

  // Calculate base subtotal from items
  const baseSubtotal = payload.items.reduce((acc, item) => acc + (item.service.price * item.qty), 0);

  // Generate Invoice No
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const invoiceNo = `INV-${dateStr}-${randomSuffix}`;

  const totalAmount = baseSubtotal - payload.financials.discount_amount + payload.financials.tax_amount + payload.financials.service_fee_amount;
  const paidAmount = payload.payment.amount_paid;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);
  const changeAmount = Math.max(0, paidAmount - totalAmount);
  
  const customerToken = `CUST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // 2. Insert Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      invoice_no: invoiceNo,
      customer_id: finalCustomerId,
      user_id: payload.user_id,
      customer_token: customerToken,
      
      laundry_status: payload.payment.method === 'CASH' ? LaundryStatus.PROCESS : LaundryStatus.WAITING_PAYMENT,
      payment_status: payload.payment.method === 'CASH' ? PaymentStatus.PAID : PaymentStatus.UNPAID,
      
      discount_id: payload.financials.discount_id || null,
      tax_id: payload.financials.tax_id || null,
      service_fee_id: payload.financials.fee_id || null,
      
      subtotal: baseSubtotal,
      discount_amount: payload.financials.discount_amount,
      tax_amount: payload.financials.tax_amount,
      service_fee_amount: payload.financials.service_fee_amount,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      remaining_amount: remainingAmount,
      change_amount: changeAmount,
      
      whatsapp_sent: false
    }])
    .select('id')
    .single();

  if (orderError) throw new Error(`Order Error: ${orderError.message}`);
  
  const orderId = order.id;

  // 3. Bulk Insert Order Items
  const orderItemsPayload = payload.items.map(item => ({
    order_id: orderId,
    service_id: item.service.id,
    qty: item.qty,
    price_per_unit: item.service.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload);

  if (itemsError) throw new Error(`Items Error: ${itemsError.message}`);

  // 4. Insert Order Payment
  // For dummy NON_CASH we might create a mock token
  const isCash = payload.payment.method === 'CASH';
  
  const { error: paymentError } = await supabase
    .from('order_payments')
    .insert([{
      order_id: orderId,
      amount: payload.payment.amount_paid,
      payment_type: isCash ? 'TUNAI' : 'NON_TUNAI',
      midtrans_snap_token: isCash ? null : `mock-snap-${Date.now()}`,
      midtrans_payment_url: isCash ? null : `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-${Date.now()}`,
      midtrans_status: isCash ? null : 'pending'
    }]);

  if (paymentError) throw new Error(`Payment Error: ${paymentError.message}`);
};

export const updateOrderStatus = async ({ 
  orderId, 
  laundryStatus, 
  paymentStatus 
}: { 
  orderId: string; 
  laundryStatus?: LaundryStatus; 
  paymentStatus?: PaymentStatus;
}): Promise<void> => {
  const supabase = createClient();
  const updates: any = {};
  if (laundryStatus) updates.laundry_status = laundryStatus;
  if (paymentStatus) updates.payment_status = paymentStatus;

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (error) throw new Error(error.message);
};
