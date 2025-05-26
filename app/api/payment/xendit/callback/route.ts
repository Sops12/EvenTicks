import { NextResponse } from 'next/server';
import { XenditService } from '@/lib/xendit';

const xenditService = new XenditService({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verify the callback signature
    const signature = request.headers.get('x-callback-token');
    
    if (!signature || signature !== process.env.XENDIT_CALLBACK_TOKEN) {
      throw new Error('Invalid callback signature');
    }

    // Handle different payment statuses
    switch (body.status) {
      case 'PAID':
        // Update your database to mark the order as paid
        // You can add your database update logic here
        console.log('Payment successful for invoice:', body.external_id);
        break;
      case 'EXPIRED':
        // Handle expired payment
        console.log('Payment expired for invoice:', body.external_id);
        break;
      case 'FAILED':
        // Handle failed payment
        console.log('Payment failed for invoice:', body.external_id);
        break;
      default:
        console.log('Unknown payment status:', body.status, 'for invoice:', body.external_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process callback' },
      { status: 500 }
    );
  }
} 