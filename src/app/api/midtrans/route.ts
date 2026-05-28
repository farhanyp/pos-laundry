import { NextResponse } from 'next/server';
import { MidtransPaymentLinkRequest } from '@/types/midtrans';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('[Midtrans API] Received request body:', body);

    const { order_id, invoice_no, gross_amount, customer_details, item_details } = body;

    if (!order_id || !gross_amount) {
      console.log('[Midtrans API] Missing parameters');
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const baseUrl = process.env.MIDTRANS_BASE_URL || 'https://api.sandbox.midtrans.com';

    const authString = Buffer.from(`${serverKey}:`).toString('base64');
    const midtransOrderId = `${invoice_no}-${Date.now()}`;

    const parameter: MidtransPaymentLinkRequest = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(gross_amount)
      },
      customer_required: false,
      usage_limit: 1,
      expiry: {
        duration: 1,
        unit: 'days'
      },
      customer_details: {
        first_name: customer_details?.name || 'Customer',
        phone: customer_details?.whatsapp_no || '00000000000'
      },
      item_details: item_details && item_details.length > 0 ? item_details : [
        {
          id: invoice_no,
          price: Math.round(gross_amount),
          quantity: 1,
          name: `Pembayaran ${invoice_no}`
        }
      ],
      enabled_payments: ["qris", "other_qris"]
    };

    console.log('[Midtrans API] Sending parameter to Midtrans:', JSON.stringify(parameter, null, 2));

    const response = await fetch(`${baseUrl}/v1/payment-links`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(parameter)
    });

    const transaction = await response.json();
    console.log('[Midtrans API] Response from Midtrans:', JSON.stringify(transaction, null, 2));

    if (!response.ok) {
      console.error('[Midtrans API] Error Response:', transaction);
      return NextResponse.json({
        error: transaction.error_messages ? transaction.error_messages.join(', ') : 'Failed to create payment link'
      }, { status: response.status });
    }

    return NextResponse.json({
      token: null,
      redirect_url: transaction.payment_url,
      midtrans_order_id: transaction.order_id
    });
  } catch (error: any) {
    console.error('[Midtrans API] Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
