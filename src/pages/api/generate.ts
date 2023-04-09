// @ts-expect-error
import wasm from 'resources/tiktoken_bg.wasm?module';
import model from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { init, Tiktoken } from '@dqbd/tiktoken/lite/init';
import { OpenAIStream } from 'helpers/Stream';
import { NextRequest } from 'next/server';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const config = {
  runtime: 'edge',
};

const FILES_TO_IGNORE = [
  'package-lock.json',
  'yarn.lock',
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log',
  '.pnpm-debug.log',
];
/**
 * Removes lines from the diff that don't start with a special character
 */
function removeExcessiveLinesFromChunk(diff: string) {
  return diff
    .split('\n')
    .filter((line) => /^\W/.test(line))
    .join('\n');
}

/**
 * Prepare a diff for use in the prompt by removing stuff like
 * the lockfile changes and removing some of the whitespace.
 */
function prepareDiff(diff: string, minify = false) {
  if (!minify) {
    return diff;
  }

  const chunks = Array.from(
    diff.matchAll(/diff --git[\s\S]*?(?=diff --git|$)/g),
    (match) => match[0]
  ).map((chunk) => chunk.replace(/ {2,}/g, ''));

  return chunks
    .filter((chunk) => {
      const firstLine = chunk.split('\n')[0];

      for (const file of FILES_TO_IGNORE) {
        if (firstLine.includes(file)) {
          return false;
        }
      }

      return true;
    })
    .map(removeExcessiveLinesFromChunk)
    .join('\n');
}

function generatePrompt(
  diff: string,
  gitmojis: string,
  context?: string,
  minify = false
) {
  return `
    Refer to the provided git diff or code snippet and provide a suitable commit message.

    When reviewing the diff or code, focus on identifying the main purpose of the changes.
    Are they fixing a bug, adding a new feature, improving performance or readability, or something else?
    Use this information to craft a concise and detailed gitmoji commit message that clearly describes what the provided code or diff does.

    Describe the change to the best of your capabilities in one short sentence. Don't go into too much detail.

    When reviewing a diff, pay attention to the changed filenames and extract the context of the changes.
    This will help you create a more relevant and informative commit message.
    Here are some examples of how you can interpret some changed filenames:
      - Files or filepaths that reference testing are usually related to tests.
      - Markdown files are usually related to documentation.
      - Config file adjustments are usually related to configuration changes.

    Here is a list of gitmoji codes and their descriptions of what they mean when they are used: """
    ${gitmojis}
    """

    Try to match the generated message to a fitting emoji using its description from the provided list above.
    So go look in the descriptions and find the one that best matches the description.

    Always start your commit message with a gitmoji followed by the message starting with a capital letter.
    Never mention filenames or function names in the message.

    Don't do this:
      - :bug: Fix issue in calculateTotalPrice function
      - :zap: Improve performance of calculateTopProducts function
      - :lipstick: Refactor styling for calculateCartTotal function
      - :memo: Update documentation for getProductById function

    Do this:
      - :bug: Fix issue with shopping cart checkout process
      - :zap: Improve performance of search functionality
      - :lipstick: Refactor styling for product details page
      - :memo: Update documentation for API endpoints

    ${
      context
        ? `
          Refer to the provided additional context to assist you with choosing a correct gitmoji
          and constructing a good message: """
          ${context}
          """
        `
        : ''
    }

    Here is the provided git diff or code snippet: """
    ${prepareDiff(diff, minify)}
    """
  `;
}

export default async function handler(req: NextRequest) {
  await init((imports) => WebAssembly.instantiate(wasm, imports));
  const encoding = new Tiktoken(
    model.bpe_ranks,
    model.special_tokens,
    model.pat_str
  );

  const body = await req.json();
  let prompt = generatePrompt(body.code, body.choices, body.context, false);

  // Check if exceeding model max token length and minify accordingly
  if (encoding.encode(prompt).length > 4096) {
    prompt = generatePrompt(body.code, body.choices, body.context, true);

    // Check if minified prompt is still too long
    if (encoding.encode(prompt).length > 4096) {
      return new Response(
        `The diff is too large (${
          encoding.encode(prompt).length
        }), try reducing the number of staged changes.`,
        {
          status: 400,
        }
      );
    }
  }

  const stream = await OpenAIStream({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 300,
    stream: true,
    n: 1,
  });

  // Free the encoding to prevent memory leaks
  encoding.free();

  return new Response(stream);
}
