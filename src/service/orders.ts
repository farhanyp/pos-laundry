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

export const createOrderTransaction = async (payload: OrderPayload): Promise<string> => {
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

  const customerToken = `CUST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // 2. Insert Order (Created as UNPAID and WAITING_PAYMENT initially)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      invoice_no: invoiceNo,
      customer_id: finalCustomerId,
      user_id: payload.user_id,
      customer_token: customerToken,

      laundry_status: LaundryStatus.WAITING_PAYMENT,
      payment_status: PaymentStatus.UNPAID,

      discount_id: payload.financials.discount_id || null,
      tax_id: payload.financials.tax_id || null,
      service_fee_id: payload.financials.fee_id || null,

      subtotal: baseSubtotal,
      discount_amount: payload.financials.discount_amount,
      tax_amount: payload.financials.tax_amount,
      service_fee_amount: payload.financials.service_fee_amount,
      total_amount: totalAmount,
      paid_amount: 0,
      remaining_amount: totalAmount,
      change_amount: 0,

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

  return orderId;
};

export const processOrderPayment = async (payload: { 
  orderId: string, 
  paymentMethod: 'CASH' | 'NON_TUNAI', 
  expectedAmount: number, 
  cashGiven: number, 
  totalAmount: number,
  paymentMode?: 'FULL' | 'DP' | 'SETTLE'
}): Promise<{ redirectUrl?: string, token?: string }> => {
  const supabase = createClient();
  const isCash = payload.paymentMethod === 'CASH';

  let midtransToken = null;
  let midtransRedirectUrl = null;

  if (!isCash) {
    console.log(`[Order Service] Fetching order details for Midtrans. Order ID: ${payload.orderId}`);
    // 1. Fetch order details for Midtrans
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        invoice_no, 
        customers(name, whatsapp_no),
        discount_amount,
        tax_amount,
        service_fee_amount,
        total_amount,
        order_items(
          qty,
          price_per_unit,
          services(name)
        )
      `)
      .eq('id', payload.orderId)
      .single();

    if (orderError) {
      console.error(`[Order Service] Failed to fetch order:`, orderError.message);
      throw new Error(`Failed to fetch order: ${orderError.message}`);
    }

    // Build item_details for Midtrans
    let item_details: any[] = [];
    
    // Only send detailed items if it's a full payment to avoid Midtrans validation error (sum of items must equal gross_amount)
    if (payload.paymentMode === 'FULL' && payload.expectedAmount === order.total_amount && order.order_items) {
      item_details = order.order_items.map((item: any, index: number) => ({
        id: `item-${index}`,
        price: item.price_per_unit,
        quantity: item.qty,
        name: (item.services?.name || 'Laundry Item').substring(0, 50)
      }));

      if (order.discount_amount > 0) {
        item_details.push({ id: 'discount', price: -order.discount_amount, quantity: 1, name: 'Discount' });
      }
      if (order.tax_amount > 0) {
        item_details.push({ id: 'tax', price: order.tax_amount, quantity: 1, name: 'Tax' });
      }
      if (order.service_fee_amount > 0) {
        item_details.push({ id: 'fee', price: order.service_fee_amount, quantity: 1, name: 'Service Fee' });
      }

      // Safety check: verify sum matches exact expectedAmount
      const calculatedSum = item_details.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
      if (calculatedSum !== payload.expectedAmount) {
        item_details = []; // Reset if mismatch, fallback to generic
      }
    }

    console.log(`[Order Service] Sending request to /api/midtrans for invoice: ${order.invoice_no}`);
    // 2. Call our Next.js API route to generate Payment Link
    const res = await fetch('/api/midtrans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: `${payload.orderId}-${Date.now()}`,
        invoice_no: order.invoice_no,
        gross_amount: payload.expectedAmount,
        customer_details: order.customers,
        item_details: item_details.length > 0 ? item_details : undefined
      })
    });

    const midtransData = await res.json();
    console.log(`[Order Service] Response from /api/midtrans:`, midtransData);

    if (!res.ok) {
      console.error(`[Order Service] Failed to generate Midtrans link:`, midtransData.error);
      throw new Error(midtransData.error || 'Failed to generate Midtrans link');
    }

    midtransToken = midtransData.token;
    midtransRedirectUrl = midtransData.redirect_url;
  }

  console.log(`[Order Service] Inserting order_payments record for Order ID: ${payload.orderId}`);
  const { error: paymentError } = await supabase
    .from('order_payments')
    .insert([{
      order_id: payload.orderId,
      amount: payload.expectedAmount,
      payment_type: isCash ? 'TUNAI' : 'NON_TUNAI',
      midtrans_snap_token: midtransToken,
      midtrans_payment_url: midtransRedirectUrl,
      midtrans_status: isCash ? null : 'pending'
    }]);

  if (paymentError) throw new Error(`Payment Error: ${paymentError.message}`);

  // Fetch existing order to calculate cumulative paid amount if SETTLE
  const { data: currentOrder } = await supabase.from('orders').select('paid_amount, laundry_status').eq('id', payload.orderId).single();
  const currentPaid = currentOrder?.paid_amount || 0;
  const currentLaundryStatus = currentOrder?.laundry_status;

  let newPaidAmount = isCash ? (currentPaid + payload.expectedAmount) : currentPaid;
  let newRemaining = Math.max(0, payload.totalAmount - newPaidAmount);
  let changeAmount = Math.max(0, payload.cashGiven - payload.expectedAmount);
  
  let newPaymentStatus = PaymentStatus.UNPAID;
  let newLaundryStatus = LaundryStatus.WAITING_PAYMENT;

  if (isCash) {
    if (payload.paymentMode === 'DP') {
      newPaymentStatus = PaymentStatus.DP;
      if (currentLaundryStatus === LaundryStatus.WAITING_PAYMENT) {
        newLaundryStatus = LaundryStatus.PROCESS;
      }
    } else {
      // FULL or SETTLE
      newPaymentStatus = PaymentStatus.PAID;
      if (currentLaundryStatus === LaundryStatus.WAITING_PAYMENT) {
        newLaundryStatus = LaundryStatus.PROCESS;
      }
    }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: newPaymentStatus !== PaymentStatus.UNPAID ? newPaymentStatus : undefined,
      laundry_status: newLaundryStatus !== LaundryStatus.WAITING_PAYMENT ? newLaundryStatus : undefined,
      paid_amount: isCash ? newPaidAmount : undefined, 
      remaining_amount: isCash ? newRemaining : undefined,
      change_amount: isCash ? changeAmount : undefined
    })
    .eq('id', payload.orderId);

  if (updateError) throw new Error(`Update Order Error: ${updateError.message}`);

  return { 
    redirectUrl: midtransRedirectUrl || undefined,
    token: midtransToken || undefined
  };
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
  if (laundryStatus) {
    if (laundryStatus === LaundryStatus.COMPLETED) {
      const { data: order } = await supabase.from('orders').select('remaining_amount, payment_status').eq('id', orderId).single();
      if (order && (order.remaining_amount > 0 || order.payment_status === PaymentStatus.DP)) {
        throw new Error("Cannot complete order: Payment is not settled yet.");
      }
    }
    updates.laundry_status = laundryStatus;
  }
  if (paymentStatus) updates.payment_status = paymentStatus;

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (error) throw new Error(error.message);
};
