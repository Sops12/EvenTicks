import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

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

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode);
    
    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add event image
    doc.addImage(ticket.event.image || '/concert-default.jpg', 'JPEG', 10, 10, 190, 100);
    
    // Add event details
    doc.setFontSize(20);
    doc.text(ticket.event.title, pageWidth/2, 120, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Artist: ${ticket.event.artist}`, 20, 140);
    doc.text(`Location: ${ticket.event.location}`, 20, 150);
    doc.text(`Date: ${new Date(ticket.event.date).toLocaleDateString()}`, 20, 160);
    doc.text(`Attendee: ${ticket.user.name || 'Guest'}`, 20, 170);
    doc.text(`Email: ${ticket.user.email || ''}`, 20, 180);
    
    // Add QR code
    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth/2 - 25, 190, 50, 50);
    
    // Add ticket ID
    doc.setFontSize(10);
    doc.text(`Ticket ID: ${ticket.id}`, pageWidth/2, 250, { align: 'center' });

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

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