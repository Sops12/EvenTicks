'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

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

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin/events');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/admin/events', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setEvents(data);
          setFilteredEvents(data);
        }
      } catch (error) {
        setError('Failed to fetch events');
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchEvents();
    }
  }, [status, session]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(events);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.artist.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        new Date(event.date).toLocaleDateString().includes(query)
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  const handleDelete = async (eventId: number) => {
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

      // Update local state
      setEvents(events.filter(event => event.id !== eventId));
      setFilteredEvents(filteredEvents.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleUpdate = async (event: Event) => {
    setEditingEvent(event);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const response = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editingEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      
      // Update the event in the state
      setEvents(events.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      setFilteredEvents(filteredEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingEvent) return;
    
    const { name, value } = e.target;
    setEditingEvent(prev => ({
      ...prev!,
      [name]: name === 'price' || name === 'availableSeats' ? Number(value) : value
    }));
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
            <h1 className="text-3xl font-bold text-white dark:text-slate-50">Manage Events</h1>
            <Link
              href="/admin/events/create"
              className="px-6 py-3 bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white rounded-lg transition-colors"
            >
              Create New Event
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search events by title, artist, location, or date..."
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

          {filteredEvents.length === 0 ? (
            <div className="text-center text-white/80 dark:text-slate-300 py-12">
              {searchQuery ? 'No events found matching your search.' : 'No events found.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
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
                      <button
                        onClick={() => handleUpdate(event)}
                        className="flex-1 bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
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

          {/* Edit Modal */}
          {editingEvent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Event</h2>
                <form onSubmit={handleSaveUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      required
                      value={editingEvent.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E91E63] dark:focus:ring-[#9C27B0] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      name="description"
                      required
                      value={editingEvent.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E91E63] dark:focus:ring-[#9C27B0] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      id="edit-location"
                      name="location"
                      required
                      value={editingEvent.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E91E63] dark:focus:ring-[#9C27B0] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date and Time
                    </label>
                    <input
                      type="datetime-local"
                      id="edit-date"
                      name="date"
                      required
                      value={editingEvent.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E91E63] dark:focus:ring-[#9C27B0] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-artist" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Artist/Performer
                    </label>
                    <input
                      type="text"
                      id="edit-artist"
                      name="artist"
                      required
                      value={editingEvent.artist}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E91E63] dark:focus:ring-[#9C27B0] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (IDR)
                    </label>
                    <input
                      type="number"
                      id="edit-price"
                      name="price"
                      required
                      min="0"
                      step="1000"
                      value={editingEvent.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E91E63] dark:focus:ring-[#9C27B0] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-availableSeats" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Seats
                    </label>
                    <input
                      type="number"
                      id="edit-availableSeats"
                      name="availableSeats"
                      required
                      min="0"
                      value={editingEvent.availableSeats}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#E91E63] dark:focus:ring-[#9C27B0] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 