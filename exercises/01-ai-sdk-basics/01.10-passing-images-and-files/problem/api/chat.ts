import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  type ModelMessage,
  type UIMessage,
  toUIMessageStream,
} from 'ai';

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: UIMessage[] = body.messages;

  const modelMessages: ModelMessage[] =
    await convertToModelMessages(messages);

  const streamTextResult = streamText({
    model: openai.chat('gpt-5.5'),
    messages: modelMessages,
  });

  const stream = toUIMessageStream({
    stream: streamTextResult.stream,
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
