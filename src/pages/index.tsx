import Head from 'next/head';
import {
  DetailedHTMLProps,
  FormEvent,
  TextareaHTMLAttributes,
  useCallback,
  useState,
} from 'react';
import styles from 'styles/Home.module.css';

const TextArea = (
  props: DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
) => {
  return <textarea className={styles.textarea} {...props} />;
};

export default function Home() {
  const [code, setCode] = useState('');
  const [context, setContext] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ code, context }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setMessage(data.message);
    },
    [code, context]
  );

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center p-4 min-h-screen text-gray-900">
      <Head>
        <title>Gitmoji Commit Generator</title>
      </Head>

      <div className="max-w-xl w-full">
        <h1 className="text-6xl font-bold text-center mb-8">
          Generate your gitmoji commit message 👋
        </h1>

        <form onSubmit={handleSubmit}>
          <TextArea
            value={code}
            placeholder="Please enter code or paste a git diff here"
            onChange={(event) => setCode(event.target.value)}
            rows={10}
          />

          <TextArea
            value={context}
            placeholder="Additionally you can provide some extra context here"
            onChange={(event) => setContext(event.target.value)}
            rows={2}
          />

          <button
            type="submit"
            disabled={!code.trim().length}
            className="w-full bg-black rounded-xl text-white font-medium px-4 py-2 hover:bg-black/80"
          >
            Generate
          </button>
        </form>

        {message && (
          <>
            <hr className="my-4 w-64 mx-auto" />

            <div
              className="flex
              flex-col
              py-4
              shadow-md
              rounded-2xl
              border
              border-gray-100"
            >
              <p
                className={styles.message}
                onClick={() => {
                  return navigator.clipboard.writeText(message);
                }}
              >
                {message}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
