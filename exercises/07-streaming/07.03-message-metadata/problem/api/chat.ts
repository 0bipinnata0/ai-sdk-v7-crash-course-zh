import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai';

// TODO:在这里的对象中添加 metadata 的类型
// 我们可能想要 { duration: number }
export type MyUIMessage = UIMessage<TODO>;

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyUIMessage[] } = await req.json();
  const { messages } = body;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: await convertToModelMessages(messages),
  });

  // TODO:计算流的开始时间
  const startTime = TODO;

  return result.toUIMessageStreamResponse<MyUIMessage>({
    // TODO:在这里添加 messageMetadata 函数
    // 如果遇到 'finish' 部件,它应该返回
    // 流的持续时间(毫秒)
    messageMetadata: TODO,
  });
};
