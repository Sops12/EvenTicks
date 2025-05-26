import { NextResponse } from 'next/server';
import { dokuClient } from '@/lib/doku-client';

export async function POST() {
  try {
    const token = await dokuClient.getAccessToken();
    
    return NextResponse.json({
      success: true,
      data: token
    });
  } catch (error) {
    console.error('Error generating DOKU token:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate token'
      },
      { status: 500 }
    );
  }
} 