import type { NextApiRequest, NextApiResponse } from 'next';
import { generate } from 'lib/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const prompt = `
    Refer to the provided git diff or code snippet and provide a suitable gitmoji commit message.

    Actively review the code or diff that will be provided and think about what the code does and what the commit message should be.
    Everyone reading the commit message should be able to understand what the commit does without having to look at the code.
    Refer to the code example or git diff below and provide a concise and meaningful gitmoji commit message that clearly indicates what the provided code does.

    ${req.body.prompt}

    The user might also provide some additional context to help you constructing the message but you can ignore it if no context is provided.

    ${req.body.context}

    A gitmoji commit message always starts with a gitmoji from the list above followed by the commit message starting with a capital letter.
    Prevent having commit messages that don't give any context about the changes made.
    So absolutely no commit messages like ":rocket: Deploy new changes" or ":bug: Fix bug" or ":recycle: Refactor code to improve performance" since these don't give any value to the commit.

    """
  `;

  const message = await generate(prompt);

  return res.status(200).json({ message });
}
