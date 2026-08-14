import { openai } from '@ai-sdk/openai';
import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type ModelMessage,
  type UIMessage,
} from 'ai';

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  // TODO:从 body 中获取 UIMessage[]
  const messages: UIMessage[] = body.messages;

  // TODO:将 UIMessage[] 转换为 ModelMessage[]
  const modelMessages: ModelMessage[] = await convertToModelMessages(messages);

  // TODO:将 modelMessages 传给 streamText
  const streamTextResult = streamText({
    model: openai.chat('gpt-5.5'),
    messages: modelMessages,
  });

  // TODO:从 streamTextResult 创建一个 UIMessageStream
  const stream = toUIMessageStream(streamTextResult);

  return createUIMessageStreamResponse({
    stream,
  });
};
