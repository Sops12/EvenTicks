import { NextResponse } from 'next/server';
import { dokuClient } from '@/lib/doku-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, customer } = body;

    // Get access token first
    const { accessToken } = await dokuClient.getAccessToken();

    // Create payment request
    const response = await fetch('https://api-sandbox.doku.com/checkout/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        order: {
          amount: amount,
          invoice_number: orderId,
          currency: 'IDR',
          line_items: [
            {
              name: 'Event Ticket',
              price: amount,
              quantity: 1,
            }
          ]
        },
        payment: {
          payment_due_date: 60, // 60 minutes
          payment_method_types: ['CREDIT_CARD', 'BANK_TRANSFER', 'EWALLET'],
        },
        customer: {
          id: customer.email,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        failure_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed`,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment');
    }

    return NextResponse.json({
      success: true,
      payment: {
        url: data.url,
        id: data.id,
        status: data.status
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process payment'
      },
      { status: 500 }
    );
  }
}
