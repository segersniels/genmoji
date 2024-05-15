import './globals.css';

import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { getDescription, getTitle } from 'helpers/seo';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: getTitle(),
  description: getDescription(),
  metadataBase: new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`),
  twitter: {
    card: 'summary_large_image',
    title: getTitle(),
    description: getDescription(),
    images: '/og-image.png',
  },
  openGraph: {
    title: getTitle(),
    description: getDescription(),
    url: 'https://genmoji.dev',
    images: '/og-image.png',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="mx-auto flex min-h-screen flex-col items-center justify-center bg-muted/50">
          {children}
        </main>

        <Analytics />
      </body>
    </html>
  );
}
