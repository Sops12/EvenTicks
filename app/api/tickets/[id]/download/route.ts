import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateTicketPDF } from '@/lib/pdf-generator';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ticketId = Number(params.id);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Verify ticket ownership
    if (ticket.userId !== Number(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure qrCode is not null
    if (!ticket.qrCode) {
      return NextResponse.json({ error: 'Invalid ticket QR code' }, { status: 400 });
    }

    const pdfBuffer = await generateTicketPDF({
      ticketId: ticket.id.toString(),
      eventTitle: ticket.event.title,
      eventDate: ticket.event.date.toISOString(), // Convert Date to string
      eventLocation: ticket.event.location,
      eventArtist: ticket.event.artist,
      userName: ticket.user.name || 'Guest',
      userEmail: ticket.user.email || '',
      qrCode: ticket.qrCode,
    });

    // Set response headers for PDF download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="ticket-${ticket.id}.pdf"`);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Failed to generate ticket PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate ticket PDF' },
      { status: 500 }
    );
  }
} 