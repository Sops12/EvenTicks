'use client';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
} 