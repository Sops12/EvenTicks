import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

type TicketData = {
  ticketId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventArtist: string;
  userName: string;
  userEmail: string;
  qrCode: string;
};

export async function generateTicketPDF(ticketData: TicketData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create QR code image
      const qrCodeDataUrl = await QRCode.toDataURL(ticketData.qrCode);
      
      // Create PDF document with built-in fonts
      const doc = new PDFDocument({
        size: 'A6',
        margin: 20,
        font: 'Courier', // Use built-in Courier font
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add background
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill('#1a1a1a');

      // Add ticket header
      doc.fontSize(20)
         .fillColor('#ffffff')
         .text('Event Ticket', { align: 'center' })
         .moveDown();

      // Add event details
      doc.fontSize(14)
         .fillColor('#ffffff')
         .text(ticketData.eventTitle, { align: 'center' })
         .moveDown(0.5);

      doc.fontSize(12)
         .fillColor('#cccccc')
         .text(`Date: ${format(new Date(ticketData.eventDate), 'MMMM dd, yyyy')}`)
         .text(`Location: ${ticketData.eventLocation}`)
         .text(`Artist: ${ticketData.eventArtist}`)
         .moveDown();

      // Add user details
      doc.fontSize(12)
         .fillColor('#cccccc')
         .text(`Attendee: ${ticketData.userName}`)
         .text(`Email: ${ticketData.userEmail}`)
         .moveDown();

      // Add QR code
      doc.image(qrCodeDataUrl, {
        fit: [150, 150],
        align: 'center'
      });

      // Add ticket ID
      doc.fontSize(10)
         .fillColor('#999999')
         .text(`Ticket ID: ${ticketData.ticketId}`, { align: 'center' })
         .moveDown();

      // Add footer
      doc.fontSize(8)
         .fillColor('#666666')
         .text('This ticket is valid for one-time entry only. Please keep it safe.', { align: 'center' });

      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
} 