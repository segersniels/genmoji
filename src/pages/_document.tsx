import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="description"
          content="Generate your gitmoji commit message"
        />
        <meta property="og:site_name" content="genmoji.xyz" />
        <meta
          property="og:description"
          content="Generate your gitmoji commit message"
        />
        <meta property="og:title" content="Gitmoji Commit Generator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gitmoji Commit Generator" />
        <meta
          name="twitter:description"
          content="Generate your gitmoji commit message"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
