import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type ModelMessage,
  type UIMessage,
} from 'ai';

const ADVANCED_MODEL = openai.chat('gpt-5.5');
const BASIC_MODEL = openai.chat('gpt-5.5');

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
      // TODO:使用 generateText 调用一个模型,
      // 传入 modelMessages,并自己编写系统提示词。
      const modelRouterResult = TODO;

      console.timeEnd('Model Calculation Time');
      console.log(
        'modelRouterResult',
        modelRouterResult.text.trim(),
      );

      // TODO:使用 modelRouterResult 来决定使用哪个模型。
      // 如果无法确定使用哪个模型,就使用基础模型。
      const modelSelected: 'advanced' | 'basic' = TODO;

      const streamTextResult = streamText({
        model:
          modelSelected === 'advanced'
            ? ADVANCED_MODEL
            : BASIC_MODEL,
        messages: modelMessages,
      });

      writer.merge(
        streamTextResult.toUIMessageStream({
          // TODO:把模型添加到消息 metadata 中,
          // 让前端可以显示它。
          messageMetadata: TODO,
        }),
      );
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
