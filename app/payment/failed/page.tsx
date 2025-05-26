'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoice_id');

  useEffect(() => {
    // You can add additional logic here to handle the failed payment
    // For example, updating the payment status in your database
  }, [invoiceId]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#C2185B] via-[#7B1FA2] to-[#4527A0] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-red-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white dark:text-slate-50 mb-4">
              Payment Failed
            </h1>
            <p className="text-white/80 dark:text-slate-300 mb-8">
              We couldn't process your payment. Please try again or contact support if the problem persists.
            </p>
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#E91E63] hover:bg-[#D81B60] dark:bg-[#9C27B0] dark:hover:bg-[#7B1FA2] text-white rounded-lg transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 