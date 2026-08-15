import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type ModelMessage,
  type UIMessage,
  toUIMessageStream,
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
        model: openai.chat('gpt-5.5'),
        messages: modelMessages,
      });

      writer.merge(
        toUIMessageStream({ stream: streamTextResult.stream }),
      );

      await streamTextResult.consumeStream();

      // TODO:给 streamText 调用添加 output 选项,
      // 因为我们需要使用结构化输出来可靠地
      // 生成多条建议
      const followupSuggestionsResult = streamText({
        model: openai.chat('gpt-5.5'),
        // TODO:使用 Output.object + zod 定义建议的 schema
        output: TODO,
        messages: [
          ...modelMessages,
          {
            role: 'assistant',

            content: [
              {
                type: 'text',
                text: await streamTextResult.text,
              },
            ],
          },
          {
            role: 'user',

            content: [
              {
                type: 'text',

                // TODO:修改提示词,告诉 LLM
                text:
                  // 返回一个建议数组
                  '我接下来应该问什么问题?只返回问题文本。',
              },
            ],
          },
        ],
      });

      const dataPartId = crypto.randomUUID();

      let fullSuggestion = '';

      // TODO:改为遍历 partialOutputStream
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
