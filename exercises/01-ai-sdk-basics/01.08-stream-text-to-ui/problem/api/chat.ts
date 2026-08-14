import { openai } from '@ai-sdk/openai';
import {
  createUIMessageStreamResponse,
  streamText,
  type ModelMessage,
  type UIMessage,
} from 'ai';

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  // TODO:从 body 中获取 UIMessage[]
  const messages: UIMessage[] = TODO;

  // TODO:将 UIMessage[] 转换为 ModelMessage[]
  const modelMessages: ModelMessage[] = TODO;

  // TODO:将 modelMessages 传给 streamText
  const streamTextResult = streamText({
    model: openai.chat('gpt-5.5'),
  });

  // TODO:从 streamTextResult 创建一个 UIMessageStream
  const stream = TODO;

  return createUIMessageStreamResponse({
    stream,
  });
};
