'use server';

import Gitmoji from 'types/Gitmoji';

export async function getGitmojis(): Promise<{
  list: Gitmoji[];
  choices: string;
}> {
  const response = await fetch(`${process.env.HOST}/api/gitmojis`);

  if (!response.ok) {
    throw new Error('Failed to fetch gitmojis');
  }

  return response.json();
}
