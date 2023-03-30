import type { NextApiRequest, NextApiResponse } from 'next';
import { generate } from 'lib/api';
import BackupList from 'resources/gitmojis.json';

interface Gitmoji {
  code: string;
  emoji: string;
  description: string;
}

function generateChoices(gitmojis: Gitmoji[]) {
  return gitmojis
    .map((gitmoji) => `${gitmoji.code} - ${gitmoji.description}`)
    .join('\n');
}

async function fetchGitmojis() {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/carloscuesta/gitmoji/master/packages/gitmojis/src/gitmojis.json'
    );

    if (response.ok) {
      const data: { gitmojis: Gitmoji[] } = await response.json();

      return {
        list: data.gitmojis,
        choices: generateChoices(data.gitmojis),
      };
    }
  } catch (err) {
    // noop
  }

  return {
    list: BackupList.gitmojis,
    choices: generateChoices(BackupList.gitmojis),
  };
}

const FILES_TO_IGNORE = [
  'package-lock.json',
  'yarn.lock',
  'npm-debug.log',
  'yarn-debug.log',
  'yarn-error.log',
  '.pnpm-debug.log',
];

/**
 * Attempt to remove lockfile changes from the diff
 */
export function removeLockfileChanges(diff: string) {
  const result = Array.from(
    diff.matchAll(/diff --git[\s\S]*?(?=diff --git|$)/g),
    (match) => match[0]
  );

  return result
    .filter((chunk) => {
      const firstLine = chunk.split('\n')[0];

      for (const file of FILES_TO_IGNORE) {
        if (firstLine.includes(file)) {
          return false;
        }
      }

      return true;
    })
    .join('\n');
}

/**
 * Do some additional post processing on the received answer
 */
function parseMessage(message: string | undefined, gitmojis: Gitmoji[]) {
  if (!message) {
    return;
  }

  // Replace emojis with codes
  for (const gitmoji of gitmojis) {
    message = message.replace(gitmoji.emoji, gitmoji.code);
  }

  // Remove trailing punctuation
  return message.replace(/\.$/g, '');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const data = await fetchGitmojis();
  const prompt = `
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
    ${data.choices}
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
      req.body.context
        ? `
          Refer to the provided additional context to assist you with choosing a correct gitmoji
          and constructing a good message: """
          ${req.body.context}
          """
        `
        : ''
    }

    Here is the provided git diff or code snippet: """
    ${removeLockfileChanges(req.body.code)}
    """
  `;

  const message = await generate(prompt);

  return res.status(200).json({
    message: parseMessage(message, data.list),
  });
}
