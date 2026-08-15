import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  validateUIMessages,
  type ModelMessage,
  type UIMessage,
  toUIMessageStream,
} from 'ai';

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  let messages: UIMessage[];

  try {
    messages = await validateUIMessages({
      messages: body.messages,
    });
  } catch (error) {
    return new Response('无效的消息', { status: 400 });
  }

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
