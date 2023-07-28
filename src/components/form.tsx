'use client';

import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import Gitmoji from 'types/Gitmoji';
import { AiOutlineLoading } from 'react-icons/ai';

import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import Style from 'enums/Style';
import StyleSelect from './style-select';
import useLocalStorageState from 'use-local-storage-state';
import { Separator } from './ui/separator';

interface Props {
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

export default function Form(props: Props) {
  const { gitmojis, onGenerate } = props;
  const [diff, setDiff] = useState('');
  const [style, setStyle] = useLocalStorageState<Style>('style', {
    defaultValue: Style.Code,
  });

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
    <div className="py-4">
      <StyleSelect
        className="absolute top-4 right-4"
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
      >
        <Textarea
          className="min-h-[60px] flex-1 resize-none border px-4 py-[1.3rem] shadow-none sm:text-sm"
          value={diff}
          placeholder="Please paste a diff or code snippet here"
          onChange={(e) => setDiff(e.target.value)}
          rows={10}
        />

        <Button className="w-full my-2" disabled={!diff.length}>
          {isLoading ? (
            <AiOutlineLoading className="animate-spin font-bold mx-2 stroke-[3rem]" />
          ) : (
            'Generate'
          )}
        </Button>
      </form>

      {!!generatedMessage && (
        <>
          <Separator className="my-4 w-64 mx-auto" />

          <div
            className="flex flex-col items-center p-4 shadow-md rounded-md border border-gray-100 hover:bg-gray-50 cursor-copy"
            onClick={() => {
              return navigator.clipboard.writeText(generatedMessage);
            }}
          >
            <code>{generatedMessage}</code>
          </div>
        </>
      )}
    </div>
  );
}