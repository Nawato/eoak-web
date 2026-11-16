import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter, Oswald } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import { getSiteSettings, getNavigationContent } from '@/lib/sanity';
import { getNavLinks } from '@/lib/nav';
import { resolveFeatures } from '@/lib/features';
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

export const viewport: Viewport = {
  themeColor: '#09090b',
  colorScheme: 'dark',
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const bandName = settings?.bandName ?? siteName;
  const faviconUrl = hasImage(settings?.favicon) ? getImageUrl(settings.favicon, 256, 256) : undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: bandName,
      template: `%s | ${bandName}`,
    },
    description: siteDescription,
    applicationName: bandName,
    authors: [{ name: bandName, url: siteUrl }],
    creator: bandName,
    publisher: bandName,
    alternates: { canonical: '/' },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      siteName: bandName,
      locale: 'en_US',
      title: bandName,
      description: siteDescription,
      url: '/',
    },
    twitter: {
      card: 'summary_large_image',
      title: bandName,
      description: siteDescription,
    },
    icons: {
      icon: faviconUrl ?? '/icon.svg',
      apple: '/apple-icon',
    },
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
  const features = resolveFeatures(settings?.features);
  const links = getNavLinks({
    ...navigation,
    features,
    hasInstagram: hasInstagramConfiguration(),
    instagramHeading: settings?.instagramHeading,
    pressUrl: settings?.pressUrl,
    pressLabel: settings?.pressLabel,
    pressDescription: settings?.pressDescription,
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
        <CookieBanner />
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
          pressUrl={features.pressLink ? settings?.pressUrl : null}
          pressLabel={settings?.pressLabel}
          pressDescription={settings?.pressDescription}
        />
      </body>
    </html>
  );
}
