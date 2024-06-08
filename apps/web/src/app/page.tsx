import Link from 'next/link';

import Image from 'next/image';
import Demo from '../../../cli/demo.gif';
import { FaArrowRight } from 'react-icons/fa';
import { Button } from 'components/ui/button';

export default function Page() {
  return (
    <div className="flex flex-col items-center space-y-12 p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Generate gitmoji commit messages
        </h1>

        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-xl leading-tight text-muted-foreground sm:w-[512px]">
            Why spend time thinking about commit messages when you can generate
            them using AI?
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <Button asChild>
          <a href="https://github.com/segersniels/genmoji">Download</a>
        </Button>

        <Button variant="link" asChild>
          <Link href="/web" className="text-xs">
            Or try it out here <FaArrowRight className="ml-1 inline h-2 w-2" />
          </Link>
        </Button>
      </div>

      <div className="hidden flex-1 overflow-hidden rounded-2xl shadow-lg sm:block">
        <Image src={Demo} alt="demo" />
      </div>
    </div>
  );
}
