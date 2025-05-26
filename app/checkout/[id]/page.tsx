'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';

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

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [paymentInfo, setPaymentInfo] = useState<{
    qrCode?: string;
    virtualAccountNumber?: string;
    paymentUrl?: string;
    expiryDate?: string;
    ewalletInfo?: {
      account_number?: string;
      payment_code?: string;
    };
    directDebitInfo?: {
      checkoutUrl?: string;
      paymentCode?: string;
      accountNumber?: string;
    };
  } | null>(null);

  // Check authentication status
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/checkout/${params.id}`);
    }
  }, [status, router, params.id]);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setEvent(data);
        }
      } catch (error) {
        setError('Failed to fetch event details');
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [params.id]);

  useEffect(() => {
    // Load Doku Jokul Checkout script
    const script = document.createElement('script');
    script.src = 'https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (!event) {
      alert('Event information is not available. Please try again.');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Ensure ticket quantity is between 1 and 5
    const finalQuantity = Math.min(5, Math.max(1, ticketQuantity));
    setTicketQuantity(finalQuantity);

    try {
      setLoading(true);
      const response = await fetch('/api/payment/xendit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: `ORDER-${Date.now()}`,
          amount: event.price * finalQuantity,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Payment request failed');
      }

      // Create tickets after successful payment request
      const ticketResponse = await fetch('/api/my/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          eventId: event.id,
          quantity: finalQuantity
        }),
      });

      if (!ticketResponse.ok) {
        const ticketError = await ticketResponse.json();
        throw new Error(ticketError.error || 'Failed to create tickets');
      }

      // Store payment info in state
      setPaymentInfo({
        paymentUrl: data.payment.paymentUrl,
        expiryDate: data.payment.expiryDate,
      });

      // Open Xendit payment page in a new window
      if (data.payment.paymentUrl) {
        window.open(data.payment.paymentUrl, '_blank');
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Ensure ticketQuantity is always a number
  const safeTicketQuantity = Number.isFinite(ticketQuantity) && ticketQuantity > 0 ? ticketQuantity : 1;

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

  if (error || !event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#C2185B] via-[#7B1FA2] to-[#4527A0] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center text-white dark:text-slate-200">
              <h3 className="text-xl font-semibold">Error</h3>
              <p className="text-white/80 dark:text-slate-300 mt-2">{error || 'Event not found'}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Event Details */}
            <div className="glass rounded-2xl p-6">
              <div className="relative h-64 w-full mb-6 rounded-xl overflow-hidden">
                <Image
                  src={event.image || '/concert-default.jpg'}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <h1 className="text-2xl font-bold text-white dark:text-slate-50 mb-4">{event.title}</h1>
              <p className="text-white/80 dark:text-slate-300 mb-6">{event.description}</p>
              <div className="space-y-4">
                <div className="flex items-center text-white/80 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </div>
                <div className="flex items-center text-white/80 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-white/80 dark:text-slate-300">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {event.artist}
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white dark:text-slate-50 mb-6">Complete Your Purchase</h2>
              
              {/* Ticket Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white dark:text-slate-200 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      const currentQty = typeof ticketQuantity === 'number' ? ticketQuantity : 1;
                      setTicketQuantity(Math.max(1, currentQty - 1));
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    disabled={!event || ticketQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-white dark:text-slate-50">
                    {typeof ticketQuantity === 'number' ? ticketQuantity : 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentQty = typeof ticketQuantity === 'number' && !isNaN(ticketQuantity) ? ticketQuantity : 1;
                      const maxQty = event?.availableSeats ? Math.min(5, event.availableSeats) : 5;
                      const newQty = Math.min(maxQty, currentQty + 1);
                      setTicketQuantity(newQty);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    disabled={!event || ticketQuantity >= 5 || (event && ticketQuantity >= event.availableSeats)}
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-white/60 dark:text-slate-400 mt-2">
                  Maximum 5 tickets per user
                </p>
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-white dark:text-slate-50 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-white/80 dark:text-slate-300">
                    <span>Ticket Price</span>
                    <span>{event ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(event.price) : '-'}</span>
                  </div>
                  <div className="flex justify-between text-white/80 dark:text-slate-300">
                    <span>Quantity</span>
                    <span>{event ? safeTicketQuantity : '-'}</span>
                  </div>
                  <div className="border-t border-white/10 my-2"></div>
                  <div className="flex justify-between text-white dark:text-slate-50 font-semibold">
                    <span>Total</span>
                    <span>{event ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(event.price * safeTicketQuantity) : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white dark:text-slate-200 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white dark:text-slate-200 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white dark:text-slate-200 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-white/5 dark:bg-gray-900/50 border border-white/10 dark:border-gray-700 rounded-lg text-white dark:text-slate-100 placeholder-white/50 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 dark:focus:ring-gray-500"
                  />
                </div>
                <div className="mt-8">
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {loading ? 'Processing...' : 'Pay with Xendit'}
                  </button>
                </div>
              </form>

              {/* Payment Instructions */}
              {paymentInfo && (
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <h3 className="text-lg font-semibold text-white dark:text-slate-50 mb-4">Payment Instructions</h3>
                  <div className="space-y-3">
                    <p className="text-white/80 dark:text-slate-300">
                      Please complete your payment using one of the following methods:
                    </p>
                    {paymentInfo.directDebitInfo ? (
                      <div className="bg-white/10 p-4 rounded-lg">
                        <p className="text-white/90 dark:text-slate-200 font-medium mb-2">DANA Payment Instructions:</p>
                        {paymentInfo.directDebitInfo.accountNumber && (
                          <p className="text-white dark:text-slate-50 text-xl font-mono mb-2">
                            Account Number: {paymentInfo.directDebitInfo.accountNumber}
                          </p>
                        )}
                        {paymentInfo.directDebitInfo.paymentCode && (
                          <p className="text-white dark:text-slate-50 text-xl font-mono mb-2">
                            Payment Code: {paymentInfo.directDebitInfo.paymentCode}
                          </p>
                        )}
                        <p className="text-white/70 dark:text-slate-400 text-sm">
                          Valid until: {paymentInfo.expiryDate}
                        </p>
                        {paymentInfo.directDebitInfo.checkoutUrl && (
                          <div className="mt-4">
                            <a
                              href={paymentInfo.directDebitInfo.checkoutUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full px-6 py-3 bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white rounded-lg transition-colors text-center"
                            >
                              Pay with DANA
                            </a>
                          </div>
                        )}
                      </div>
                    ) : paymentInfo.qrCode ? (
                      <div className="bg-white/10 p-4 rounded-lg">
                        <p className="text-white/90 dark:text-slate-200 font-medium mb-2">Scan QR Code:</p>
                        <div className="flex justify-center mb-4">
                          <img 
                            src={paymentInfo.qrCode} 
                            alt="QRIS Payment Code" 
                            className="w-48 h-48"
                          />
                        </div>
                        <p className="text-white/70 dark:text-slate-400 text-sm text-center">
                          Valid until: {paymentInfo.expiryDate}
                        </p>
                      </div>
                    ) : paymentInfo.virtualAccountNumber ? (
                      <div className="bg-white/10 p-4 rounded-lg">
                        <p className="text-white/90 dark:text-slate-200 font-medium mb-2">Virtual Account Number:</p>
                        <p className="text-white dark:text-slate-50 text-xl font-mono mb-2">{paymentInfo.virtualAccountNumber}</p>
                        <p className="text-white/70 dark:text-slate-400 text-sm">
                          Valid until: {paymentInfo.expiryDate}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 