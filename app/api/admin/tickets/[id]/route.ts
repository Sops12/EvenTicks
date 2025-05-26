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

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        event: true,
        user: true
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
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

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        event: true
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Start a transaction to update both ticket and event
    await prisma.$transaction([
      // Delete the ticket
      prisma.ticket.delete({
        where: {
          id: parseInt(params.id)
        }
      }),
      // Update the event's available seats
      prisma.event.update({
        where: {
          id: ticket.eventId
        },
        data: {
          availableSeats: {
            increment: 1
          },
          soldOut: false
        }
      })
    ]);

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
