import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Oswald } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSiteSettings } from '@/lib/sanity';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
});

export const metadata: Metadata = {
  title: {
    default: 'End Of All Known',
    template: '%s | End Of All Known',
  },
  description:
    'Official website of End Of All Known – dark, atmospheric metalcore. Music, tour dates, bio and press material.',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const settings = await getSiteSettings();
  const bandName = settings?.bandName ?? 'End Of All Known';

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} ${oswald.variable} font-sans bg-background text-foreground antialiased`}>
        <Navbar bandName={bandName} socialLinks={settings?.socialLinks ?? []} />
        <main className="min-h-screen">{children}</main>
        <Footer bandName={bandName} socialLinks={settings?.socialLinks ?? []} />
      </body>
    </html>
  );
}
