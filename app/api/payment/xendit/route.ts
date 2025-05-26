import { NextResponse } from 'next/server';
import { XenditService } from '@/lib/xendit';

const xenditService = new XenditService({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, orderId, customer } = body;

    if (!amount || !orderId || !customer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payment = await xenditService.createPayment({
      amount,
      orderId,
      customer,
    });

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    );
  }
} 