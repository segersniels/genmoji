import Link from 'next/link';

import Image from 'next/image';
import Demo from '../../../cli/demo.gif';
import { FaArrowRight, FaGithub } from 'react-icons/fa';

export const runtime = 'edge';

export default async function Page() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col overflow-hidden sm:flex-row sm:rounded-md sm:border">
        <div className="hidden flex-1 sm:block">
          <Image src={Demo} alt="demo" />
        </div>

        <div className="flex w-96 flex-col justify-center space-y-4 px-4 text-center sm:p-12">
          <h1 className="text-5xl font-bold tracking-tighter sm:text-5xl">
            Generate your{' '}
            <Link href="https://gitmoji.dev" target="_blank">
              gitm<p className="inline text-4xl sm:text-5xl">😀</p>ji
            </Link>{' '}
            commit message.
          </h1>

          <div className="flex flex-col items-center space-y-4">
            <p className="leading-tight text-muted-foreground">
              Grab the CLI tool from GitHub below and generate your commit
              message from the comfort of your terminal.
            </p>

            <Link href="https://github.com/segersniels/genmoji" target="_blank">
              <FaGithub className="h-8 w-8 hover:text-gray-700" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center space-y-8 px-4 sm:px-0">
        <Link href="/web">
          <h2 className="text-xl font-bold tracking-tighter sm:text-3xl">
            Or try out the web version here{' '}
            <FaArrowRight className="inline h-4 w-4" />
          </h2>
        </Link>
      </div>
    </div>
  );
}
