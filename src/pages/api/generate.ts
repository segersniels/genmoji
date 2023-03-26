import type { NextApiRequest, NextApiResponse } from 'next';
import { generate } from 'lib/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const prompt = `
    Refer to the provided git diff or code snippet and provide a suitable gitmoji commit message.
    When reviewing the diff or code, focus on identifying the main purpose of the changes.
    Are they fixing a bug, adding a new feature, improving performance or readability, or something else?
    Use this information to craft a concise and meaningful gitmoji commit message that clearly indicates what the provided snippet does.
    Remember, clarity and conciseness are key. Use simple language and avoid technical jargon.
    A good commit message should provide enough information to understand the changes without being too verbose.

    To help you understand what works and what doesn't, here are some examples of good and bad commit messages:
    Good: :sparkles: Add new feature for user authentication
    Bad: :rocket: Update code

    When reviewing a diff, pay attention to the changed filenames and use this information to extract the context of the changes.
    This will help you create a more relevant and informative commit message.
    If the user provides additional context, use it to further refine your message. But remember, the message should still be clear and concise.
    Finally, always start your gitmoji commit message with a gitmoji followed by the commit message starting with a capital letter.

    ${req.body.code}

    Optional additional context below:

    ${req.body.context}
`;

  const message = await generate(prompt);

  return res.status(200).json({ message });
}
