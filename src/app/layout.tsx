import './globals.css';

import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

import Footer from 'components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Genmoji',
  description: 'Generate your gitmoji commit message',
  twitter: {
    card: 'summary_large_image',
    title: 'Genmoji',
    description: 'Generate your gitmoji commit message',
    images: ['https://genmoji.xyz/og-image.png'],
  },
  openGraph: {
    title: 'Genmoji',
    description: 'Generate your gitmoji commit message',
    images: ['https://genmoji.xyz/og-image.png'],
    url: 'https://genmoji.xyz',
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
        <main className="mx-auto flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
          {children}

          <Footer />
        </main>

        <Analytics />
      </body>
    </html>
  );
}
