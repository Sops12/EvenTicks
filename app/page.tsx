'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
  soldOut: boolean;
};

export default function LandingPage() {
  const { data: session, status } = useSession();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setEvents(data);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError('Invalid data format received from server');
          console.error('Invalid events data:', data);
        }
      } catch (error) {
        setError('Failed to fetch events');
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollPosition = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#C2185B] via-[#7B1FA2] to-[#4527A0] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
        {/* Hero Section */}
        <div className="relative min-h-[60vh] flex items-center justify-center px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl dark:text-slate-50">
                Discover Amazing Concerts
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-100 max-w-2xl mx-auto dark:text-slate-200">
                Find and book tickets for the best concerts happening around you.
              </p>
              <div className="mt-10 flex gap-x-6 justify-center">
                {status === 'authenticated' ? (
                  <Link 
                    href="#events"
                    className="rounded-full bg-[#E91E63] dark:bg-[#9C27B0] px-8 py-3 text-white dark:text-slate-50 hover:bg-[#D81B60] dark:hover:bg-[#7B1FA2] transition-all duration-300"
                  >
                    Browse Events
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/login"
                      className="rounded-full bg-[#E91E63] dark:bg-[#E91E63] px-8 py-3 text-white font-semibold hover:bg-[#D81B60] dark:hover:bg-[#D81B60] transition-all duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-full bg-white/10 backdrop-blur-sm px-8 py-3 text-white font-semibold hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Section - Available to all users */}
        <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
          <div className="glass rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white dark:text-slate-200 mb-2">Search Event</label>
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full px-4 py-2.5 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500 transition-all duration-200"
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredEvents = events.filter(event => 
                      event.title.toLowerCase().includes(searchTerm) ||
                      event.description.toLowerCase().includes(searchTerm) ||
                      event.location.toLowerCase().includes(searchTerm) ||
                      event.artist.toLowerCase().includes(searchTerm)
                    );
                    setEvents(filteredEvents);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white dark:text-slate-200 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Where?"
                  className="w-full px-4 py-2.5 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500 transition-all duration-200"
                  onChange={(e) => {
                    const location = e.target.value.toLowerCase();
                    const filteredEvents = events.filter(event => 
                      event.location.toLowerCase().includes(location)
                    );
                    setEvents(filteredEvents);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white dark:text-slate-200 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500 transition-all duration-200"
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const filteredEvents = events.filter(event => 
                      event.date.startsWith(selectedDate)
                    );
                    setEvents(filteredEvents);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Events Section */}
        <div id="events" className="relative max-w-7xl mx-auto px-6 py-24">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white dark:border-slate-200"></div>
            </div>
          ) : error ? (
            <div className="text-center text-white dark:text-slate-200 py-12">
              <h3 className="text-xl font-semibold">Error</h3>
              <p className="text-white/80 dark:text-slate-300 mt-2">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-white dark:text-slate-200 py-12">
              <h3 className="text-xl font-semibold">No events found</h3>
              <p className="text-white/80 dark:text-slate-300 mt-2">Check back later for upcoming concerts!</p>
            </div>
          ) : (
            <div className="relative">
              {/* Left scroll button */}
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 glass p-3 rounded-full text-white dark:text-slate-200 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Scrollable container */}
              <div
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div className="inline-flex gap-6 px-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="w-[350px] flex-none group rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 glass shadow-lg border"
                    >
                      <div className="relative h-48 w-full">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                        <Image
                          src={event.image || '/concert-default.jpg'}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white dark:text-slate-50 mb-2">{event.title}</h3>
                        <div className="flex items-center text-white/70 dark:text-slate-400 text-sm mb-4">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </div>
                        <div className="flex items-center justify-between text-white/70 dark:text-slate-400 text-sm mb-4">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="text-right">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(event.price)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-white/70 dark:text-slate-400 text-sm">
                            {event.availableSeats} seats left
                          </span>
                          {event.soldOut && (
                            <span className="bg-red-500/20 text-red-300 dark:bg-red-900/30 dark:text-red-400 text-sm px-3 py-1 rounded-full">
                              Sold Out
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/checkout/${event.id}`}
                          className={`block w-full py-2 text-center rounded-lg font-medium transition-all duration-300 ${
                            event.soldOut 
                              ? 'bg-gray-500 dark:bg-gray-700 cursor-not-allowed'
                              : 'bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2]'
                          } text-white dark:text-slate-50`}
                        >
                          {event.soldOut ? 'Sold Out' : 'View Details'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right scroll button */}
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 glass p-3 rounded-full text-white dark:text-slate-200 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Features Section - Show only for non-authenticated users */}
        {status !== 'authenticated' && (
          <div className="max-w-7xl mx-auto px-6 py-24 glass mt-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white dark:text-slate-50 mb-4">Why Choose Eventick?</h2>
              <p className="text-white/80 dark:text-slate-300 max-w-2xl mx-auto">
                We provide the best experience for event organizers and attendees
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Easy Booking',
                  description: 'Book tickets in just a few clicks with our simple and secure booking system.',
                  icon: '🎫'
                },
                {
                  title: 'Verified Events',
                  description: 'All events are verified to ensure you get authentic tickets every time.',
                  icon: '✅'
                },
                {
                  title: '24/7 Support',
                  description: 'Our customer support team is always here to help you with any questions.',
                  icon: '��'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="glass rounded-xl p-6 text-center hover:transform hover:scale-105 transition duration-300"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white dark:text-slate-50 mb-2">{feature.title}</h3>
                  <p className="text-white/80 dark:text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Us Section */}
        <div id="about" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white dark:text-slate-50 mb-4">About Eventick</h2>
            <p className="text-white/80 dark:text-slate-300 max-w-2xl mx-auto">
              Your premier destination for discovering and booking amazing events
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side - Image */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="/about-image.jpg"
                alt="About Eventick"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Right side - Content */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white dark:text-slate-50">
                Connecting People Through Events
              </h3>
              <p className="text-white/80 dark:text-slate-300">
                At Eventick, we believe in the power of live events to bring people together. Our platform makes it easy to discover, book, and enjoy the best events in your area.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="glass p-6 rounded-xl">
                  <h4 className="text-xl font-semibold text-white dark:text-slate-50 mb-2">10K+</h4>
                  <p className="text-white/80 dark:text-slate-300">Events Listed</p>
                </div>
                <div className="glass p-6 rounded-xl">
                  <h4 className="text-xl font-semibold text-white dark:text-slate-50 mb-2">50K+</h4>
                  <p className="text-white/80 dark:text-slate-300">Happy Users</p>
                </div>
                <div className="glass p-6 rounded-xl">
                  <h4 className="text-xl font-semibold text-white dark:text-slate-50 mb-2">100+</h4>
                  <p className="text-white/80 dark:text-slate-300">Cities</p>
                </div>
                <div className="glass p-6 rounded-xl">
                  <h4 className="text-xl font-semibold text-white dark:text-slate-50 mb-2">24/7</h4>
                  <p className="text-white/80 dark:text-slate-300">Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold text-white dark:text-slate-50 mb-4">Our Mission</h3>
              <p className="text-white/80 dark:text-slate-300">
                To make event discovery and booking seamless, creating memorable experiences for everyone. We're committed to connecting people with the events they love.
              </p>
            </div>
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold text-white dark:text-slate-50 mb-4">Our Vision</h3>
              <p className="text-white/80 dark:text-slate-300">
                To become the world's most trusted platform for event discovery and booking, fostering community and creating lasting memories through shared experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white dark:text-slate-50 mb-4">Contact Us</h2>
            <p className="text-white/80 dark:text-slate-300 max-w-2xl mx-auto">
              Have questions? We're here to help!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold text-white dark:text-slate-50 mb-6">Get in Touch</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-2.5 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-2.5 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white rounded-lg transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
            
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold text-white dark:text-slate-50 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white dark:text-slate-50 font-medium">Phone</h4>
                    <p className="text-white/80 dark:text-slate-300">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white dark:text-slate-50 font-medium">Email</h4>
                    <p className="text-white/80 dark:text-slate-300">support@eventick.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white dark:text-slate-50 font-medium">Location</h4>
                    <p className="text-white/80 dark:text-slate-300">123 Event Street, City, Country</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white dark:text-slate-50 mb-4">Frequently Asked Questions</h2>
            <p className="text-white/80 dark:text-slate-300 max-w-2xl mx-auto">
              Find answers to common questions about our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "How do I book an event?",
                answer: "Simply browse our events, select the one you're interested in, and click 'Book Now'. Follow the prompts to complete your purchase."
              },
              {
                question: "Can I get a refund?",
                answer: "Yes, we offer refunds according to our refund policy. Please check the event details for specific refund terms."
              },
              {
                question: "How do I create an account?",
                answer: "Click the 'Sign Up' button in the top right corner and follow the registration process. It only takes a few minutes!"
              },
              {
                question: "Are the events verified?",
                answer: "Yes, all events on our platform are verified to ensure authenticity and quality."
              }
            ].map((faq, index) => (
              <div key={index} className="glass p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-white dark:text-slate-50 mb-2">{faq.question}</h3>
                <p className="text-white/80 dark:text-slate-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
