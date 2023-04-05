import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />

        <meta
          name="description"
          content="Generate your gitmoji commit message"
        />
        <meta property="og:site_name" content="genmoji.xyz" />
        <meta
          property="og:description"
          content="Generate your gitmoji commit message"
        />
        <meta property="og:title" content="Genmoji" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Genmoji" />
        <meta
          name="twitter:description"
          content="Generate your gitmoji commit message"
        />

        <meta property="og:image" content="https://genmoji.xyz/og-image.png" />
        <meta name="twitter:image" content="https://genmoji.xyz/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
