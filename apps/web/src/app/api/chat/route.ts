import { OpenAIStream, StreamingTextResponse } from 'ai';
import { generateSystemMessage, prepareDiff } from 'helpers/generate';
import {
  Configuration,
  OpenAIApi,
  ChatCompletionRequestMessage,
} from 'openai-edge';

export const runtime = 'edge';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  const {
    diff,
    gitmojis,
  }: {
    gitmojis: string;
    diff: string;
    messages: ChatCompletionRequestMessage[]; // Default chat completion messages with history
  } = await req.json();

  const response = await openai.createChatCompletion({
    user: 'genmoji.dev',
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: generateSystemMessage(gitmojis),
      },
      {
        role: 'user',
        content: prepareDiff(diff),
      },
    ],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 300,
    stream: true,
    n: 1,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
