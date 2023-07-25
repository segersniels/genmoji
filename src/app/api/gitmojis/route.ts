import { NextResponse } from 'next/server';
import BackupList from 'resources/gitmojis.json';
import Gitmoji from 'types/Gitmoji';

function generateChoices(gitmojis: Gitmoji[]) {
  return gitmojis
    .map((gitmoji) => `${gitmoji.code} - ${gitmoji.description}`)
    .join('\n');
}

export async function GET() {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/carloscuesta/gitmoji/master/packages/gitmojis/src/gitmojis.json'
    );

    if (response.ok) {
      const data: { gitmojis: Gitmoji[] } = await response.json();

      return NextResponse.json({
        list: data.gitmojis,
        choices: generateChoices(data.gitmojis),
      });
    }
  } catch (err) {
    return NextResponse.json({
      list: BackupList.gitmojis,
      choices: generateChoices(BackupList.gitmojis),
    });
  }
}
