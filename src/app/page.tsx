import Link from 'next/link';

import styles from './styles.module.css';
import Form from 'components/form';
import { getGitmojis } from './actions';

export const runtime = 'edge';

export default async function Page() {
  const gitmojis = await getGitmojis();

  return (
    <div className="max-w-xl w-full">
      <h1 className="text-7xl font-bold text-center mb-8 tracking-tighter">
        Generate your{' '}
        <Link
          href="https://gitmoji.dev"
          className='underline'
          target="_blank"
        >
          gitmoji
        </Link>{' '}
        commit message 👋
      </h1>

      <Form gitmojis={gitmojis} />
    </div>
  );
}
