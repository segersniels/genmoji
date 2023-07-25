import Link from 'next/link';
import Gitmoji from 'types/Gitmoji';

import styles from './styles.module.css';
import Form from './_components/Form';

async function fetchGitmojis(): Promise<{
  list: Gitmoji[];
  choices: string;
}> {
  const response = await fetch(`${process.env.HOST}/api/gitmojis`);

  if (!response.ok) {
    throw new Error('Failed to fetch gitmojis');
  }

  return response.json();
}

export default async function Page() {
  const gitmojis = await fetchGitmojis();

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>
        Generate your{' '}
        <Link
          href="https://gitmoji.dev"
          className={styles.gitmoji}
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
