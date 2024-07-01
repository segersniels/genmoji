import { getGitmojis } from 'app/actions';
import Form from './form';
import { Button } from 'components/ui/button';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export default async function Web() {
  const gitmojis = await getGitmojis();

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-2 px-4 sm:w-[25vw] sm:px-0">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Try it out
          </h1>

          <p className="animate-bounce text-5xl">👇</p>
        </div>

        <Button variant="link" asChild>
          <Link href="/" className="text-xs">
            <FaArrowLeft className="mr-1 inline h-2 w-2" /> Or download the app
          </Link>
        </Button>
      </div>

      <Form className="w-full" gitmojis={gitmojis} />
    </div>
  );
}
