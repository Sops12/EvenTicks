import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(params.id)
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
      availableSeats,
      image 
    } = await req.json();

    if (!title || !description || !location || !date || !artist || !price || !availableSeats) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const event = await prisma.event.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        title,
        description,
        location,
        date: new Date(date),
        artist,
        price: Number(price),
        availableSeats: Number(availableSeats),
        image: image || '/concert-default.jpg',
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if there are any tickets for this event
    const tickets = await prisma.ticket.findFirst({
      where: {
        eventId: parseInt(params.id)
      }
    });

    if (tickets) {
      return NextResponse.json(
        { error: 'Cannot delete event with existing tickets' },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: {
        id: parseInt(params.id)
      }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 