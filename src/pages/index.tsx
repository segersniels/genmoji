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
    <div className={styles.container}>
      <Head>
        <title>Genmoji</title>
      </Head>

      <div className={styles.wrapper}>
        <h1 className={styles.title}>
          Generate your gitmoji commit message 👋
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

          <button
            type="submit"
            className={styles.button}
            disabled={!code.trim().length}
          >
            Generate
          </button>
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
    </div>
  );
}
