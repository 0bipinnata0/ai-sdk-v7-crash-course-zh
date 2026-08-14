import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai';
import { openai } from '@ai-sdk/openai';

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[]; id: string } =
    await req.json();
  const { messages, id } = body;

  console.log('id', id);

  const result = streamText({
    model: openai.chat('gpt-5.5'),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
};
