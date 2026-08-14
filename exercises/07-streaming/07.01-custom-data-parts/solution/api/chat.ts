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

      const followupSuggestionsResult = streamText({
        model: google('gemini-2.5-flash'),
        messages: [
          ...modelMessages,
          {
            role: 'assistant',

            content: [{
              type: 'text',
              text: await streamTextResult.text
            }]
          },
          {
            role: 'user',

            content: [{
              type: 'text',
              text: '我接下来应该问什么问题?只返回问题文本。'
            }]
          },
        ],
      });

      const dataPartId = crypto.randomUUID();

      let fullSuggestion = '';

      for await (const chunk of followupSuggestionsResult.textStream) {
        fullSuggestion += chunk;
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
