import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        userId: Number(session.user.id)
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            date: true,
            image: true,
            artist: true
          }
        }
      }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { eventId, quantity = 1 } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const eventInt = Number(eventId);
    if (isNaN(eventInt)) {
      return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 });
    }

    // Validate quantity
    const ticketQuantity = Math.min(5, Math.max(1, Number(quantity)));
    if (isNaN(ticketQuantity) || ticketQuantity < 1 || ticketQuantity > 5) {
      return NextResponse.json({ error: 'Invalid ticket quantity' }, { status: 400 });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventInt }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user already has tickets for this event
    const existingTickets = await prisma.ticket.count({
      where: {
        userId: Number(session.user.id),
        eventId: eventInt,
      },
    });

    if (existingTickets + ticketQuantity > 5) {
      return NextResponse.json(
        { error: `You can only have a maximum of 5 tickets for this event. You already have ${existingTickets} tickets.` },
        { status: 400 }
      );
    }

    // Create multiple tickets
    const tickets = await Promise.all(
      Array(ticketQuantity).fill(null).map(() =>
        prisma.ticket.create({
          data: {
            eventId: eventInt,
            userId: Number(session.user.id),
            qrCode: uuidv4(),
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                description: true,
                location: true,
                date: true,
                image: true,
                artist: true
              }
            }
          }
        })
      )
    );

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Failed to create tickets:', error);
    return NextResponse.json(
      { error: 'Failed to create tickets' },
      { status: 500 }
    );
  }
}
