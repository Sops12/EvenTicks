'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isHomePage = pathname === '/';

  return (
    <nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isAuthPage 
          ? 'bg-white/90 dark:bg-gray-900/90 shadow-sm dark:shadow-gray-800/30' 
          : isHomePage
            ? 'bg-gradient-to-r from-[#C2185B]/90 via-[#7B1FA2]/90 to-[#4527A0]/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm shadow-sm'
            : 'bg-gradient-to-r from-[#C2185B]/90 via-[#7B1FA2]/90 to-[#4527A0]/90 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <span className={`text-2xl font-bold transition-all duration-300 ${
                isAuthPage 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400' 
                  : 'text-white group-hover:opacity-90'
              }`}>
                🎫 Eventick
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link 
              href="/#events" 
              className="px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2 border-transparent text-white/90 hover:text-white hover:border-white/50"
            >
              Browse Events
            </Link>
            <Link 
              href="/#about" 
              className="px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2 border-transparent text-white/90 hover:text-white hover:border-white/50"
            >
              About Us
            </Link>
            <Link 
              href="/#contact" 
              className="px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2 border-transparent text-white/90 hover:text-white hover:border-white/50"
            >
              Contact
            </Link>
            <Link 
              href="/#faq" 
              className="px-3 py-2 text-sm font-medium transition-all duration-200 border-b-2 border-transparent text-white/90 hover:text-white hover:border-white/50"
            >
              FAQ
            </Link>

            <div className={`h-6 w-px mx-2 transition-all duration-300 ${
              isAuthPage ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white/20'
            }`}></div>

            <ThemeToggle />

            {!session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isAuthPage
                      ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isAuthPage
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 text-white hover:opacity-90 shadow-md hover:shadow-lg'
                      : 'bg-white text-indigo-600 hover:bg-white/90 shadow-md hover:shadow-lg dark:bg-gray-800 dark:text-indigo-400'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/my-tickets"
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isAuthPage
                      ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  My Tickets
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isAuthPage
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 text-white hover:opacity-90 shadow-md hover:shadow-lg'
                      : 'bg-white text-indigo-600 hover:bg-white/90 shadow-md hover:shadow-lg dark:bg-gray-800 dark:text-indigo-400'
                  }`}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/#events"
                className="text-white/80 hover:text-white dark:text-slate-300 dark:hover:text-slate-50 transition-colors"
              >
                Browse Events
              </Link>
              <Link
                href="/#about"
                className="text-white/80 hover:text-white dark:text-slate-300 dark:hover:text-slate-50 transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/#contact"
                className="text-white/80 hover:text-white dark:text-slate-300 dark:hover:text-slate-50 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/#faq"
                className="text-white/80 hover:text-white dark:text-slate-300 dark:hover:text-slate-50 transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
