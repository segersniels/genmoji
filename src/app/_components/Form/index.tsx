'use client';

import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';
import Gitmoji from 'types/Gitmoji';
import { AiOutlineLoading } from 'react-icons/ai';
import useLocalStorageState from 'use-local-storage-state';

import styles from './styles.module.css';
import Dropdown from './Dropdown';

enum Style {
  Emoji = 'emoji',
  Code = 'code',
}

const STYLE_OPTIONS = [
  {
    display: '👋',
    value: Style.Emoji,
  },
  {
    display: ':code:',
    value: Style.Code,
  },
];

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

const GenerateButton = ({
  disabled,
  isGenerating,
}: {
  disabled: boolean;
  isGenerating: boolean;
}) => {
  if (isGenerating) {
    return (
      <button type="submit" className={styles.button} disabled={disabled}>
        <AiOutlineLoading className="animate-spin font-bold mx-2 stroke-[3rem]" />
      </button>
    );
  }

  return (
    <button type="submit" className={styles.button} disabled={disabled}>
      Generate
    </button>
  );
};

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
    <>
      <Dropdown
        className={styles.dropdown}
        value={style}
        options={STYLE_OPTIONS}
        onChange={(value) => setStyle(value.value)}
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
        <textarea
          className={styles.textarea}
          value={diff}
          placeholder="Please paste a diff or code snippet here"
          onChange={(e) => setDiff(e.target.value)}
          rows={10}
        />

        <GenerateButton disabled={!diff.length} isGenerating={isLoading} />
      </form>

      {!!generatedMessage && (
        <>
          <hr className="my-4 w-64 mx-auto" />

          <div
            className={styles.message}
            onClick={() => {
              return navigator.clipboard.writeText(generatedMessage);
            }}
          >
            <p>{generatedMessage}</p>
          </div>
        </>
      )}
    </>
  );
}
