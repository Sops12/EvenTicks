// app/api/admin/events/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { 
      title, 
      description, 
      location, 
      date, 
      artist, 
      price, 
      totalSeats,
      image = '/concert-default.jpg'
    } = await req.json();
    
    if (!title || !description || !location || !date || !artist || !price || !totalSeats) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate image size if it's a base64 string
    if (image.startsWith('data:image')) {
      const base64Data = image.split(',')[1];
      const imageSize = Math.ceil((base64Data.length * 3) / 4);
      if (imageSize > 2 * 1024 * 1024) { // 2MB limit
        return NextResponse.json(
          { error: 'Image size must be less than 2MB' },
          { status: 400 }
        );
      }
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        date: new Date(date),
        artist,
        price: Number(price),
        totalSeats: Number(totalSeats),
        availableSeats: Number(totalSeats),
        soldOut: false,
        image,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
