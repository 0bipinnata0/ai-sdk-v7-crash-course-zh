import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type AsyncIterableStream,
  type ModelMessage,
  type StreamTextResult,
  type UIMessage,
  type UIMessageStreamWriter,
} from 'ai';

export type MyMessage = UIMessage<
  never,
  {
    // TODO:在这里声明 data-output 类型。
    // 我们需要两个属性:
    // - model: string - 生成文本的模型名称
    // - text: string - 模型生成的文本
    output: TODO;
  }
>;

const streamModelText = async (opts: {
  textStream: AsyncIterableStream<string>;
  model: string;
  writer: UIMessageStreamWriter<MyMessage>;
}) => {
  // TODO:把 textStream 中的文本流式传输到
  // data-output 部件
};

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: MyMessage[] = body.messages;

  const modelMessages: ModelMessage[] =
    await convertToModelMessages(messages);

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      const firstStreamResult = streamText({
        model: google('gemini-2.5-flash-lite'),
        messages: modelMessages,
      });

      const secondStreamResult = streamText({
        model: google('gemini-2.5-flash'),
        messages: modelMessages,
      });

      // TODO:使用 Promise.all,为每个模型调用 streamModelText
      // 并传入相应的模型
      await Promise.all(TODO);
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
