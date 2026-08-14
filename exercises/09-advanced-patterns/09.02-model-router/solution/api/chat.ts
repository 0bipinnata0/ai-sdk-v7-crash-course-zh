import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type ModelMessage,
  type UIMessage,
} from 'ai';

const ADVANCED_MODEL = google('gemini-2.5-flash');
const BASIC_MODEL = google('gemini-2.5-flash-lite');

export type MyMessage = UIMessage<{
  model: 'advanced' | 'basic';
}>;

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: MyMessage[] = body.messages;

  const modelMessages: ModelMessage[] =
    await convertToModelMessages(messages);

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      console.time('Model Calculation Time');
      const modelRouterResult = await generateText({
        model: BASIC_MODEL,
        instructions: `
          你是一个模型路由器。你的工作是判断应该使用高级模型还是基础模型。

          你会收到一段对话历史。你需要根据提出的问题,判断应该使用高级模型还是基础模型。

          <rules>
            - 如果问题是关于琐碎的事情,使用基础模型。
            - 如果问题涉及任何形式的计数或数学,使用高级模型。
          </rules>

          <output-format>
            返回单个数字:0 或 1。
            返回 0 表示选择基础模型。
            返回 1 表示选择高级模型。
          </output-format>
        `,
        messages: modelMessages,
      });

      console.timeEnd('Model Calculation Time');
      console.log(
        'modelRouterResult',
        modelRouterResult.text.trim(),
      );

      const modelSelected =
        modelRouterResult.text.trim() === '1'
          ? 'advanced'
          : // 注意,兜底是基础模型
            'basic';

      const streamTextResult = streamText({
        model:
          modelSelected === 'advanced'
            ? ADVANCED_MODEL
            : BASIC_MODEL,
        messages: modelMessages,
      });

      writer.merge(
        streamTextResult.toUIMessageStream({
          messageMetadata: ({ part }) => {
            if (part.type === 'start') {
              return {
                model: modelSelected,
              };
            }
          },
        }),
      );
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
