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
      try {
        const data: { gitmojis: Gitmoji[] } = await response.json();

        return {
          list: data.gitmojis,
          choices: generateChoices(data.gitmojis),
        };
      } catch (err) {
        // noop
      }
    }
  } catch (err) {
    // noop
  }

  return {
    list: BackupList.gitmojis,
    choices: generateChoices(BackupList.gitmojis),
  };
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
    Refer to the provided git diff or code snippet and provide a suitable gitmoji commit message.
    When reviewing the diff or code, focus on identifying the main purpose of the changes.
    Are they fixing a bug, adding a new feature, improving performance or readability, or something else?
    Use this information to craft a concise and meaningful gitmoji commit message that clearly indicates what the provided snippet does.
    Remember, clarity and conciseness are key. Use simple language and avoid technical jargon.
    Your commit message should not exceed the 80 character limit unless it's impossible to provide enough context within the limit.
    A good commit message should provide enough information to understand the changes without being too verbose.

    To help you understand what works and what doesn't, here are some examples of good and bad commit messages:
    Good: :sparkles: Add new feature for user authentication
    Bad: :rocket: Update code

    Additionally, here is a list of gitmoji codes and their descriptions:

    ${data.choices}

    When reviewing a diff, pay attention to the changed filenames and use this information to extract the context of the changes.
    This will help you create a more relevant and informative commit message.
    Here are some examples of how you can interpret some changed filenames:
      - Files or filepaths that reference testing are usually related to tests.
      - Files ending with .md are usually related to documentation.
      - Config file adjustments are usually related to configuration changes.

    If the user provides additional context, use it to further refine your message. But remember, the message should still be clear and concise.
    Finally, always start your gitmoji commit message with a gitmoji followed by the commit message starting with a capital letter.

    ${req.body.code}

    Optional additional context below:

    ${req.body.context}

    Limit yourself to one sentence but don't end it in a punctuation mark.
  `;

  const message = await generate(prompt);

  return res.status(200).json({
    message: parseMessage(message, data.list),
  });
}
