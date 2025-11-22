import './globals.css';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata = {
  title: 'Roastive',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className="h-full bg-white dark:bg-gray-900" suppressHydrationWarning>
      <body className="h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

