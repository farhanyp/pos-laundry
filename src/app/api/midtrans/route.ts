import { NextResponse } from 'next/server';
const midtransClient = require('midtrans-client');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, invoice_no, gross_amount, customer_details } = body;

    if (!order_id || !gross_amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Create Snap API instance
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || ''
    });

    // Using order_id as the Midtrans order_id so we can correlate easily later
    // Adding timestamp suffix in case we retry payment for the same order
    const midtransOrderId = `${invoice_no}-${Date.now()}`;

    let parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(gross_amount) // Midtrans requires integer
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: customer_details?.name || 'Customer',
        phone: customer_details?.whatsapp_no || '00000000000'
      }
    };

    const transaction = await snap.createTransaction(parameter);
    
    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      midtrans_order_id: midtransOrderId
    });
  } catch (error: any) {
    console.error('Midtrans API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
