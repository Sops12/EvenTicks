'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
// import type { ThemeProviderProps } from 'next-themes';

type ThemeProviderProps = {
  children: React.ReactNode;
  [key: string]: any;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="eventick-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
} 