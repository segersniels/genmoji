/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react';
import './tailwind.css';
import { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = ({ error }) => {
  if (error) {
    return [{ title: 'Oops, something went wrong!' }];
  }

  const title = 'Genmoji';
  const description =
    'Generate your gitmoji commit message using AI. Provide a git diff and let Genmoji do the work for you.';

  return [
    { title },
    { name: 'description', content: description },
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="h-screen min-h-screen bg-background font-sans antialiased">
        <main className="mx-auto flex h-full max-w-prose flex-col items-center justify-center">
          {children}
        </main>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>

      <body className="h-screen min-h-screen bg-background font-sans antialiased">
        <main className="mx-auto flex h-full max-w-prose flex-col items-center justify-center space-y-8">
          <h1 className="text-4xl font-bold">Oops, something went wrong!</h1>
          <p className="rounded-md bg-muted p-8 font-mono text-sm">
            {JSON.stringify(error, null, 2)}
          </p>
        </main>

        <Scripts />
      </body>
    </html>
  );
}
