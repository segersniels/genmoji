import { getGitmojis } from 'app/actions';
import Form from 'components/form';
import Link from 'next/link';

export default async function Web() {
  const gitmojis = await getGitmojis();

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-8 sm:w-[25vw]">
      <h1 className="break-words text-center text-6xl font-bold tracking-tighter">
        Generate your{' '}
        <Link href="https://gitmoji.dev" target="_blank">
          gitm<p className="inline text-4xl sm:text-5xl">😀</p>ji
        </Link>{' '}
        commit message.
      </h1>

      <Form className="w-full" gitmojis={gitmojis} />
    </div>
  );
}
