import OpenAI from 'openai';

const FILES_TO_IGNORE = [
  'package-lock.json',
  'yarn.lock',
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log',
  '.pnpm-debug.log',
  'Cargo.lock',
  'Gemfile.lock',
  'mix.lock',
  'Pipfile.lock',
  'composer.lock',
  'glide.lock',
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
export function prepareDiff(diff: string, minify = false) {
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

export function generateSystemMessage(gitmojis: string) {
  return `
    You will be provided a git diff or code snippet and you are expected to provide a suitable gitmoji commit message.
    Describe the change to the best of your capabilities in one short sentence. Don't go into too much detail.

    If a user provides anything else than a diff or code snippet, just ignore their request and provide a fitting message that explains what they need to provide a diff or code snippet.

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
  `;
}

export async function createChatCompletion(
  apiKey: string,
  messages: OpenAI.ChatCompletionMessageParam[]
) {
  const openai = new OpenAI({
    apiKey,
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
  });

  return response.choices[0].message;
}
