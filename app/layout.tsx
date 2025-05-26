import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { Providers } from '@/providers/Providers';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Eventick - Concert Ticketing',
  description: 'Book your favorite concert tickets',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} min-h-screen antialiased dark:bg-gray-900`}>
        <Providers session={session}>
          <Navbar />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
