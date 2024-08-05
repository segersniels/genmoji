import Gitmoji from 'types/Gitmoji';
import BackupList from 'resources/gitmojis.json';

function generateChoices(gitmojis: Gitmoji[]) {
  return gitmojis
    .map((gitmoji) => `${gitmoji.code} - ${gitmoji.description}`)
    .join('\n');
}

export async function getGitmojis() {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/carloscuesta/gitmoji/master/packages/gitmojis/src/gitmojis.json'
    );

    if (!response.ok) {
      return {
        list: BackupList.gitmojis,
        choices: generateChoices(BackupList.gitmojis),
      };
    }

    const data: { gitmojis: Gitmoji[] } = await response.json();

    return {
      list: data.gitmojis,
      choices: generateChoices(data.gitmojis),
    };
  } catch (err) {
    return {
      list: BackupList.gitmojis,
      choices: generateChoices(BackupList.gitmojis),
    };
  }
}
