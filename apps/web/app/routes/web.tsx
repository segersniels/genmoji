import { Button, buttonVariants } from 'components/ui/button';
import { ArrowLeft, Clipboard } from 'lucide-react';
import {
  ActionFunctionArgs,
  MetaArgs,
  MetaFunction,
  json,
} from '@remix-run/cloudflare';
import { getGitmojis } from '.server/gitmoji';
import {
  useLoaderData,
  Form,
  useSubmit,
  useActionData,
  Link,
} from '@remix-run/react';
import { FormEvent, useCallback, useMemo, useRef, useState } from 'react';
import useLocalForage from 'hooks/use-local-forage';
import Style from 'enums/Style';
import { createChatCompletion, generateSystemMessage } from '.server/ai';
import useEnterSubmit from 'hooks/use-enter-submit';
import StyleSelect from 'components/style-select';
import { Textarea } from 'components/ui/textarea';
import { cn, extendMeta } from 'lib/utils';

/**
 * Do some additional post processing on the received answer
 */
function parseMessage(
  message: string,
  gitmojis: { emoji: string; code: string }[],
  style: Style
) {
  // Force emojis to desired style
  for (const gitmoji of gitmojis) {
    if (style === Style.Code) {
      message = message.replace(gitmoji.emoji, gitmoji.code);
    } else {
      message = message.replace(gitmoji.code, gitmoji.emoji);
    }
  }

  // Force only one sentence if for some reason multiple are returned
  message = message.split('\n')[0];

  // Remove trailing punctuation
  return message.replace(/\.$/g, '');
}

export async function action({ request, context }: ActionFunctionArgs) {
  const body = await request.formData();

  const prompt = body.get('prompt')?.toString();
  if (!prompt) {
    throw json({ error: 'Prompt is required' }, { status: 400 });
  }

  const gitmojis = body.get('gitmojis')?.toString();
  if (!gitmojis) {
    throw json({ error: 'Gitmojis are required' }, { status: 400 });
  }

  return await createChatCompletion(context.cloudflare.env.OPENAI_API_KEY, [
    {
      role: 'system',
      content: generateSystemMessage(gitmojis),
    },
    {
      role: 'user',
      content: prompt,
    },
  ]);
}

export async function loader() {
  const gitmojis = await getGitmojis();

  return {
    gitmojis,
  };
}

export function meta({ matches }: MetaArgs) {
  const title = 'Try it out | Genmoji';

  return extendMeta(matches, [
    { title },
    { name: 'og:title', content: title },
    { name: 'twitter:title', content: title },
  ]);
}

export default function Web() {
  const gitmojis = useLoaderData<typeof loader>().gitmojis;
  const response = useActionData<typeof action>()?.content;
  const [style, setStyle] = useLocalForage<Style>('style', Style.Code);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { formRef, onKeyDown } = useEnterSubmit();
  const [prompt, setPrompt] = useState('');
  const submit = useSubmit();

  const generatedMessage = useMemo(() => {
    return response ? parseMessage(response, gitmojis.list, style) : null;
  }, [response, gitmojis.list, style]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      submit(
        {
          prompt,
          gitmojis: gitmojis.choices,
        },
        { method: 'post' }
      );

      setPrompt('');
    },
    [gitmojis, prompt, submit]
  );

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-8 px-4 sm:px-0">
      <StyleSelect
        className="absolute right-4 top-4"
        style={style}
        setStyle={setStyle}
      />

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Try it out
          </h1>

          <p className="animate-bounce text-5xl">👇</p>
        </div>

        <Link
          to="/"
          className={cn(buttonVariants({ variant: 'link' }), 'text-xs')}
          prefetch="render"
        >
          <ArrowLeft className="mr-1 inline h-2 w-2" /> Or download the app
        </Link>
      </div>

      <Form
        className="w-full space-y-4 flex flex-col items-center"
        method="post"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <Textarea
          ref={inputRef}
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          value={prompt}
          placeholder="Please paste a diff or code snippet here"
          onChange={(e) => setPrompt(e.target.value)}
          tabIndex={0}
          spellCheck={false}
          onKeyDown={onKeyDown}
        />

        <Button
          className="w-full hover:shadow-[5px_5px_0px_0px_rgba(109,40,217)] transition-shadow duration-100 shadow-[3px_3px_0px_0px_rgba(109,40,217)]"
          disabled={!prompt.length}
        >
          Generate
        </Button>
      </Form>

      {!!generatedMessage && (
        <div className="relative flex items-center justify-center rounded-md border p-4 shadow-sm">
          <Clipboard
            className="absolute right-2 top-2 h-4 w-4 cursor-pointer text-slate-400 hover:text-slate-700"
            onClick={() => {
              return navigator.clipboard.writeText(generatedMessage);
            }}
          />

          <p className="prose font-mono">{generatedMessage}</p>
        </div>
      )}
    </div>
  );
}
