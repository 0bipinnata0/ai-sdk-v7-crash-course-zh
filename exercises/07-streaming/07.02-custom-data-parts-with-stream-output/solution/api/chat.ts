import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  Output,
  streamText,
  type ModelMessage,
  type UIMessage,
  toUIMessageStream,
} from 'ai';
import { z } from 'zod';

export type MyMessage = UIMessage<
  never,
  {
    suggestions: string[];
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

      const followupSuggestionsResult = streamText({
        model: openai.chat('gpt-5.5'),
        output: Output.object({
          schema: z.object({
            suggestions: z.array(z.string()),
          }),
        }),
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
                text: '我接下来应该问什么问题?返回一个建议问题的数组。',
              },
            ],
          },
        ],
      });

      const dataPartId = crypto.randomUUID();

      for await (const chunk of followupSuggestionsResult.partialOutputStream) {
        writer.write({
          id: dataPartId,
          type: 'data-suggestions',
          data:
            chunk.suggestions?.filter(
              (suggestion) => suggestion !== undefined,
            ) ?? [],
        });
      }
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
