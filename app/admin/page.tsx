'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';

type Event = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  image: string;
  artist: string;
  price: number;
  availableSeats: number;
};

type Ticket = {
  id: number;
  eventId: number;
  userId: number;
  qrCode: string;
  event: Event;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'tickets'>('events');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.push('/login?callbackUrl=/admin');
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsResponse, ticketsResponse] = await Promise.all([
          fetch('/api/admin/events', {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }),
          fetch('/api/admin/tickets', {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })
        ]);

        if (!eventsResponse.ok || !ticketsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const eventsData = await eventsResponse.json();
        const ticketsData = await ticketsResponse.json();

        if (eventsData.error) {
          setError(eventsData.error);
        } else {
          setEvents(eventsData);
        }

        if (ticketsData.error) {
          setError(ticketsData.error);
        } else {
          setTickets(ticketsData);
        }
      } catch (error) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchData();
    }
  }, [status, session]);

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white dark:text-slate-50">Admin Dashboard</h1>
            <Link
              href="/admin/events/create"
              className="px-6 py-3 bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white rounded-lg transition-colors"
            >
              Create New Event
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'events'
                  ? 'bg-[#E91E63] text-white dark:bg-[#9C27B0]'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'tickets'
                  ? 'bg-[#E91E63] text-white dark:bg-[#9C27B0]'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              Tickets
            </button>
          </div>

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className="glass rounded-2xl overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={event.image || '/concert-default.jpg'}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white dark:text-slate-50 mb-2">{event.title}</h2>
                    <div className="space-y-2 text-white/80 dark:text-slate-300">
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {event.artist}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(event.price)}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {event.availableSeats} seats available
                      </p>
                    </div>
                    <div className="mt-6 flex space-x-4">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="flex-1 bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white py-2 px-4 rounded-lg transition-colors text-center"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="glass rounded-2xl overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={ticket.event.image || '/concert-default.jpg'}
                      alt={ticket.event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white dark:text-slate-50 mb-2">{ticket.event.title}</h2>
                    <div className="space-y-2 text-white/80 dark:text-slate-300">
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {ticket.user.name}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {ticket.user.email}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(ticket.event.date).toLocaleDateString()}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {ticket.event.location}
                      </p>
                    </div>
                    <div className="mt-6">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="w-full bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white py-2 px-4 rounded-lg transition-colors text-center block"
                      >
                        View Details
                      </Link>
                    </div>
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
