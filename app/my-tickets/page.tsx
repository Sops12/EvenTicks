'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

type Ticket = {
  id: number;
  eventId: number;
  userId: number;
  qrCode: string;
  event: {
    id: number;
    title: string;
    description: string;
    location: string;
    date: string;
    image: string;
    artist: string;
  };
};

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/my-tickets');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch('/api/my/tickets');
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setTickets(data);
          setFilteredTickets(data);
        }
      } catch (error) {
        setError('Failed to fetch tickets');
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTickets(tickets);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = tickets.filter(ticket => 
        ticket.event.title.toLowerCase().includes(query) ||
        ticket.event.artist.toLowerCase().includes(query) ||
        ticket.event.location.toLowerCase().includes(query) ||
        new Date(ticket.event.date).toLocaleDateString().includes(query)
      );
      setFilteredTickets(filtered);
    }
  }, [searchQuery, tickets]);

  const generateTicketPDF = async (ticket: Ticket, ticketNumber: number) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(ticket.qrCode);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add event image
      doc.addImage(ticket.event.image, 'JPEG', 10, 10, 190, 100);
      
      // Add event details
      doc.setFontSize(20);
      doc.text(ticket.event.title, pageWidth/2, 120, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Artist: ${ticket.event.artist}`, 20, 140);
      doc.text(`Location: ${ticket.event.location}`, 20, 150);
      doc.text(`Date: ${new Date(ticket.event.date).toLocaleDateString()}`, 20, 160);
      doc.text(`Ticket #${ticketNumber}`, 20, 170);
      
      // Add QR code
      doc.addImage(qrCodeDataUrl, 'PNG', pageWidth/2 - 25, 180, 50, 50);
      
      doc.save(`ticket-${ticket.event.title}-${ticketNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate ticket PDF');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#C2185B] via-[#7B1FA2] to-[#4527A0] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white dark:border-slate-200"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#C2185B] via-[#7B1FA2] to-[#4527A0] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center text-white dark:text-slate-200">
              <h3 className="text-xl font-semibold">Error</h3>
              <p className="text-white/80 dark:text-slate-300 mt-2">{error}</p>
              <Link 
                href="/"
                className="inline-block mt-4 px-6 py-2 bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white rounded-lg transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#C2185B] via-[#7B1FA2] to-[#4527A0] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white dark:text-slate-50 mb-6">My Tickets</h1>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search tickets by event, artist, location, or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center text-white/80 dark:text-slate-300 py-12">
              {searchQuery ? 'No tickets found matching your search.' : 'You have no tickets yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map((ticket, index) => (
                <div key={ticket.id} className="glass rounded-2xl overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={ticket.event.image || '/concert-default.jpg'}
                      alt={ticket.event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-medium">Ticket #{index + 1}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white dark:text-slate-50 mb-2">{ticket.event.title}</h2>
                    <div className="space-y-2 text-white/80 dark:text-slate-300">
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {ticket.event.artist}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {ticket.event.location}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(ticket.event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => generateTicketPDF(ticket, index + 1)}
                      className="mt-4 w-full bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Download Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 