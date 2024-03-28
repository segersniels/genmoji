import Link from 'next/link';

import Form from 'components/form';
import { getGitmojis } from './actions';

export const runtime = 'edge';

export default async function Page() {
  const gitmojis = await getGitmojis();

  return (
    <div className="w-full max-w-xl">
      <h1 className="mb-4 text-center text-5xl font-bold tracking-tighter sm:mb-8 sm:text-7xl">
        Generate your{' '}
        <Link href="https://gitmoji.dev" target="_blank">
          gitm<p className="inline text-4xl sm:text-5xl">😀</p>ji
        </Link>{' '}
        commit message.
      </h1>

      <Form gitmojis={gitmojis} />
    </div>
  );
}
