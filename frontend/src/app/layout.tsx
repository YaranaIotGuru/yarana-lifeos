import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/layout/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Yarana LifeOS — Your Personal Life Operating System',
  description: 'Manage your daily tasks, clients, finances, and personal growth in one powerful system.',
  keywords: ['life management', 'task manager', 'client management', 'personal productivity', 'Yarana LifeOS'],
  authors: [{ name: 'Yarana' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Yarana LifeOS',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'Yarana LifeOS',
    description: 'Your personal life operating system',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.variable} style={{ background: '#090912', color: 'white', margin: 0, padding: 0, WebkitFontSmoothing: 'antialiased' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
