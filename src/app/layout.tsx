import 'styles/globals.css';

import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

import Footer from './_components/Footer';
import styles from './styles.module.css';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className={styles.container}>
          {children}
          <Footer />
        </div>

        <Analytics />
      </body>
    </html>
  );
}
