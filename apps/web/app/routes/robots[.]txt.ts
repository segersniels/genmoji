import { LoaderFunctionArgs } from '@remix-run/cloudflare';

enum PolicyType {
  UserAgent = 'User-agent',
  Allow = 'Allow',
  Disallow = 'Disallow',
  Sitemap = 'Sitemap',
  CrawlDelay = 'Crawl-delay',
}

type Policy = {
  type: PolicyType;
  value: string;
};

function getRobotsText(policies: Policy[]): string {
  let result = '';
  for (const { type, value } of policies) {
    result += `${type}: ${value}\n`;
  }

  return result;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const robots = getRobotsText([
    {
      type: PolicyType.UserAgent,
      value: '*',
    },
    {
      type: PolicyType.Allow,
      value: '/',
    },
    {
      type: PolicyType.Sitemap,
      value: `${baseUrl}/sitemap.xml`,
    },
  ]);

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, must-revalidate',
      'Content-Length': new TextEncoder().encode(robots).byteLength.toString(),
    },
  });
}
