import Head from 'next/head';
import {
  DetailedHTMLProps,
  FormEvent,
  TextareaHTMLAttributes,
  useCallback,
  useState,
} from 'react';
import styles from 'styles/Home.module.css';
import Footer from 'components/Footer';
import Link from 'next/link';
import { AiOutlineLoading } from 'react-icons/ai';
import Gitmoji from 'types/Gitmoji';

/**
 * Do some additional post processing on the received answer
 */
function parseMessage(
  message: string,
  gitmojis: { emoji: string; code: string }[]
) {
  // Replace emojis with codes
  for (const gitmoji of gitmojis) {
    message = message.replace(gitmoji.emoji, gitmoji.code);
  }

  // Force only one sentence if for some reason multiple are returned
  message = message.split('\n')[0];

  // Remove trailing punctuation
  return message.replace(/\.$/g, '');
}

const TextArea = (
  props: DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
) => {
  return <textarea className={styles.textarea} {...props} />;
};

const GenerateButton = ({
  code,
  isGenerating,
}: {
  code: string;
  isGenerating: boolean;
}) => {
  if (isGenerating) {
    return (
      <button
        type="submit"
        className={styles.button}
        disabled={!code.trim().length}
      >
        <AiOutlineLoading className="animate-spin font-bold mx-2 stroke-[3rem]" />
      </button>
    );
  }

  return (
    <button
      type="submit"
      className={styles.button}
      disabled={!code.trim().length}
    >
      Generate
    </button>
  );
};

export default function Home() {
  const [code, setCode] = useState('');
  const [context, setContext] = useState('');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      try {
        event.preventDefault();
        setMessage('');
        setIsGenerating(true);

        const response = await fetch('/api/gitmojis');
        if (!response.ok) {
          return;
        }

        const gitmojis: { list: Gitmoji[]; choices: string } =
          await response.json();
        const generate = await fetch('/api/generate', {
          method: 'POST',
          body: JSON.stringify({
            code,
            context,
            choices: gitmojis.choices,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!generate.ok) {
          return;
        }

        const data = generate.body;
        if (!data) {
          return;
        }

        const reader = data.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          setMessage((prev) =>
            parseMessage(prev + decoder.decode(value), gitmojis.list)
          );

          if (done) {
            break;
          }
        }
      } catch (err) {
        // noop
      } finally {
        setIsGenerating(false);
      }
    },
    [code, context]
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>Genmoji</title>
      </Head>

      <div className={styles.wrapper}>
        <h1 className={styles.title}>
          Generate your{' '}
          <Link
            href="https://gitmoji.dev"
            className={styles.gitmoji}
            target="_blank"
          >
            gitmoji
          </Link>{' '}
          commit message 👋
        </h1>

        <form onSubmit={handleSubmit}>
          <TextArea
            value={code}
            placeholder="Please paste a diff or code snippet here"
            onChange={(event) => setCode(event.target.value)}
            rows={10}
          />

          <TextArea
            value={context}
            placeholder="Additionally you can provide some extra context here"
            onChange={(event) => setContext(event.target.value)}
            rows={2}
          />

          <GenerateButton code={code} isGenerating={isGenerating} />
        </form>

        {message && (
          <>
            <hr className="my-4 w-64 mx-auto" />

            <div
              className={styles.message}
              onClick={() => {
                return navigator.clipboard.writeText(message);
              }}
            >
              <p>{message}</p>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
