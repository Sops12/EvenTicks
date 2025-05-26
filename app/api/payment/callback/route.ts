import { NextResponse } from 'next/server';
import { dokuClient } from '@/lib/doku-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verify the callback signature
    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');
    
    if (!signature || !timestamp) {
      throw new Error('Missing required headers');
    }

    // Get access token to verify payment status
    const { accessToken } = await dokuClient.getAccessToken();

    // Verify payment status
    const response = await fetch(`https://api-sandbox.doku.com/checkout/v1/payment/${body.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const paymentData = await response.json();

    if (!response.ok) {
      throw new Error('Failed to verify payment status');
    }

    // Handle different payment statuses
    switch (paymentData.status) {
      case 'SUCCESS':
        // Update your database to mark the order as paid
        // You can add your database update logic here
        break;
      case 'FAILED':
        // Handle failed payment
        break;
      case 'EXPIRED':
        // Handle expired payment
        break;
      default:
        // Handle other statuses
        break;
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