'use client';

import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import Gitmoji from 'types/Gitmoji';
import { AiOutlineLoading, AiOutlineCopy } from 'react-icons/ai';

import { Textarea } from 'components/ui/textarea';
import { Button } from 'components/ui/button';
import Style from 'enums/Style';
import StyleSelect from 'components/style-select';
import { Separator } from 'components/ui/separator';
import useLocalStorage from 'hooks/use-local-storage';

interface Props {
  className?: string;
  gitmojis: {
    list: Gitmoji[];
    choices: string;
  };
  onGenerate?: (message: string) => void;
}

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

export default function Client(props: Props) {
  const { gitmojis, onGenerate } = props;
  const [diff, setDiff] = useState('');
  const [style, setStyle] = useLocalStorage<Style>('style', Style.Code);

  const { messages, setInput, handleSubmit, isLoading } = useChat({
    body: {
      diff,
      gitmojis: gitmojis.choices,
    },
  });

  useEffect(() => {
    if (!diff) {
      return;
    }

    setInput(diff);
  }, [diff, setInput]);

  const lastMessage = messages[messages.length - 1];
  const generatedMessage =
    lastMessage?.role === 'assistant'
      ? parseMessage(lastMessage.content, gitmojis.list, style)
      : null;

  useEffect(() => {
    if (!generatedMessage) {
      return;
    }

    onGenerate?.(generatedMessage);
  }, [generatedMessage, onGenerate]);

  return (
    <div className={props.className}>
      <StyleSelect
        className="absolute right-4 top-4"
        style={style}
        setStyle={setStyle}
      />

      <form
        onSubmit={(e) => {
          handleSubmit(e);

          /**
           * We reset the input to the original diff since the default behavior of `useChat`
           * is to clear the input after submitting
           */
          setInput(diff);
        }}
        className="space-y-4"
      >
        <Textarea
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          value={diff}
          placeholder="Please paste a diff or code snippet here"
          onChange={(e) => setDiff(e.target.value)}
          tabIndex={0}
          rows={5}
          spellCheck={false}
        />

        <Button className="w-full" disabled={!diff.length}>
          {isLoading ? (
            <AiOutlineLoading className="mx-2 animate-spin stroke-[3rem] font-bold" />
          ) : (
            'Generate'
          )}
        </Button>
      </form>

      {!!generatedMessage && (
        <>
          <Separator className="mx-auto my-4 w-64" />

          <div className="relative flex items-center justify-center rounded-md border p-4 shadow-sm">
            <AiOutlineCopy
              className="absolute right-2 top-2 cursor-pointer text-slate-400 hover:text-slate-700"
              onClick={() => {
                return navigator.clipboard.writeText(generatedMessage);
              }}
            />

            <p className="prose font-mono">{generatedMessage}</p>
          </div>
        </>
      )}
    </div>
  );
}
