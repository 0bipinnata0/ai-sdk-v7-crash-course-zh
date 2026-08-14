import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type ModelMessage,
  type UIMessage,
} from 'ai';

export type MyMessage = UIMessage<
  never,
  {
    // TODO:定义建议数据部件的类型
    TODO: TODO;
  }
>;

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: UIMessage[] = body.messages;

  const modelMessages: ModelMessage[] =
    await convertToModelMessages(messages);

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      const streamTextResult = streamText({
        model: google('gemini-2.5-flash'),
        messages: modelMessages,
      });

      writer.merge(streamTextResult.toUIMessageStream());

      await streamTextResult.consumeStream();

      const followupSuggestionsResult = streamText({
        model: google('gemini-2.5-flash'),
        messages: [
          ...modelMessages,
          {
            role: 'assistant',
            content: await streamTextResult.text,
          },
          {
            role: 'user',
            content:
              '我接下来应该问什么问题?只返回问题文本。',
          },
        ],
      });

      // 注意:为数据部件创建一个 id
      const dataPartId = crypto.randomUUID();

      // 注意:创建一个变量来存储完整的建议,
      // 因为我们每次都需要存储完整的建议
      let fullSuggestion = TODO;

      for await (const chunk of followupSuggestionsResult.textStream) {
        // TODO:把 chunk 追加到完整建议中
        fullSuggestion += TODO;

        // TODO:调用 writer.write,把数据部件
        // 写入流中
        TODO;
      }
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
