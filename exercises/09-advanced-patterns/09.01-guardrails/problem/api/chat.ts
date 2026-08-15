import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type ModelMessage,
  type UIMessage,
  toUIMessageStream,
} from 'ai';
import { GUARDRAIL_SYSTEM } from './guardrail-prompt.ts';

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: UIMessage[] = body.messages;

  const modelMessages: ModelMessage[] =
    await convertToModelMessages(messages);

  const stream = createUIMessageStream<UIMessage>({
    execute: async ({ writer }) => {
      console.time('Guardrail Time');
      // TODO:使用 generateText 调用一个模型,
      // 传入 modelMessages 和 GUARDRAIL_SYSTEM 提示词。
      //
      const guardrailResult = TODO;

      console.timeEnd('Guardrail Time');

      console.log(
        'guardrailResult',
        guardrailResult.text.trim(),
      );

      // TODO:如果 guardrailResult 是 '0',使用 text-start、
      // text-delta 和 text-end 部件向前端写一条标准回复。
      // 然后提前返回,阻止流的其余部分运行。
      // (检查前确保 trim 一下 guardrailResult.text)
      if (TODO) {
      }

      const streamTextResult = streamText({
        model: openai.chat('gpt-5.5'),
        messages: modelMessages,
      });

      writer.merge(
        toUIMessageStream({ stream: streamTextResult.stream }),
      );
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
