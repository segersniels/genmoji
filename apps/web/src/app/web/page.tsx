import { getGitmojis } from 'app/actions';
import Client from './client';

export default async function Web() {
  const gitmojis = await getGitmojis();

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-4 px-4 sm:w-[25vw] sm:px-0">
      <Client className="w-full" gitmojis={gitmojis} />
    </div>
  );
}
