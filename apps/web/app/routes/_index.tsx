import { Link } from '@remix-run/react';
import { buttonVariants } from 'components/ui/button';
import { cn } from 'lib/utils';
import { ArrowRight } from 'lucide-react';

export default function Index() {
  return (
    <div className="flex flex-col items-center space-y-8 p-4 text-center">
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
        <Link
          to="https://github.com/segersniels/genmoji"
          className={cn(
            buttonVariants(),
            'hover:shadow-[5px_5px_0px_0px_rgba(109,40,217)] transition-shadow duration-100 shadow-[3px_3px_0px_0px_rgba(109,40,217)]'
          )}
          target="_blank"
          rel="noreferrer"
        >
          Download
        </Link>

        <Link
          to="/web"
          className={cn(buttonVariants({ variant: 'link' }), 'text-xs')}
          prefetch="render"
        >
          Or try it out here <ArrowRight className="ml-1 inline h-2 w-2" />
        </Link>
      </div>

      <div className="hidden flex-1 overflow-hidden rounded-2xl sm:block">
        <img
          src="https://github.com/segersniels/genmoji/blob/master/demo.gif?raw=true"
          alt="demo"
        />
      </div>
    </div>
  );
}
