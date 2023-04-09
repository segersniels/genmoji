import { NextApiRequest, NextApiResponse } from 'next';
import BackupList from 'resources/gitmojis.json';
import Gitmoji from 'types/Gitmoji';

function generateChoices(gitmojis: Gitmoji[]) {
  return gitmojis
    .map((gitmoji) => `${gitmoji.code} - ${gitmoji.description}`)
    .join('\n');
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/carloscuesta/gitmoji/master/packages/gitmojis/src/gitmojis.json'
    );

    if (response.ok) {
      const data: { gitmojis: Gitmoji[] } = await response.json();

      return res.json({
        list: data.gitmojis,
        choices: generateChoices(data.gitmojis),
      });
    }
  } catch (err) {
    // noop
  }

  return res.json({
    list: BackupList.gitmojis,
    choices: generateChoices(BackupList.gitmojis),
  });
}
