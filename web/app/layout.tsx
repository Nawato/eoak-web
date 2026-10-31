import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Oswald } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSiteSettings, getNavigationContent } from '@/lib/sanity';
import { getNavLinks } from '@/lib/nav';
import { hasInstagramConfiguration } from '@/lib/instagram';
import { getImageUrl, hasImage } from '@/lib/sanity-image';
import { siteDescription, siteName, siteUrl } from '@/lib/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
});

const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName,
    title: siteName,
    description: siteDescription,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const faviconUrl = hasImage(settings?.favicon) ? getImageUrl(settings.favicon, 256, 256) : undefined;
  return {
    ...baseMetadata,
    icons: { icon: faviconUrl ?? '/icon.svg' },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [settings, navigation] = await Promise.all([
    getSiteSettings(),
    getNavigationContent(),
  ]);
  const links = getNavLinks({
    ...navigation,
    hasInstagram: hasInstagramConfiguration(),
    instagramHeading: settings?.instagramHeading,
  });
  const bandName = settings?.bandName ?? 'End Of All Known';

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${oswald.variable} font-sans bg-background text-foreground antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Navbar
          bandName={bandName}
          socialLinks={settings?.socialLinks ?? []}
          logo={settings?.headerLogo}
          links={links}
        />
        <main id="main" className="min-h-screen">
          {children}
        </main>
        <Footer
          bandName={bandName}
          socialLinks={settings?.socialLinks ?? []}
          creditsHeading={settings?.creditsHeading}
          photoCredits={settings?.photoCredits}
        />
      </body>
    </html>
  );
}
