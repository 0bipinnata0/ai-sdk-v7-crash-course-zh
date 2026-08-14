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
    // TODO:把类型改为 'suggestions',
    // 并让它成为字符串数组
    suggestion: string;
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

      // TODO:把 streamText 调用改为 streamObject,
      // 因为我们需要使用结构化输出来可靠地
      // 生成多条建议
      const followupSuggestionsResult = streamText({
        model: google('gemini-2.5-flash'),
        // TODO:使用 zod 定义建议的 schema
        schema: TODO,
        messages: [
          ...modelMessages,
          {
            role: 'assistant',
            content: await streamTextResult.text,
          },
          {
            role: 'user',
            content:
              // TODO:修改提示词,告诉 LLM
              // 返回一个建议数组
              '我接下来应该问什么问题?只返回问题文本。',
          },
        ],
      });

      const dataPartId = crypto.randomUUID();

      let fullSuggestion = '';

      // TODO:改为遍历 partialObjectStream
      for await (const chunk of followupSuggestionsResult.textStream) {
        fullSuggestion += chunk;

        // TODO:改为用建议数组写入数据部件。
        // 你可能需要过滤掉 undefined 的建议。
        writer.write({
          id: dataPartId,
          type: 'data-suggestion',
          data: fullSuggestion,
        });
      }
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
