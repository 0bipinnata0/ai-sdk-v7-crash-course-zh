import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type ModelMessage,
  type UIMessage,
  type UIMessageStreamWriter,
  toUIMessageStream,
} from 'ai';

const writeTextPart = (
  writer: UIMessageStreamWriter,
  text: string,
) => {
  const textPartId = crypto.randomUUID();
  writer.write({
    type: 'text-start',
    id: textPartId,
  });
  writer.write({
    type: 'text-delta',
    id: textPartId,
    delta: text,
  });
  writer.write({
    type: 'text-end',
    id: textPartId,
  });
};

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: UIMessage[] = body.messages;

  const modelMessages: ModelMessage[] =
    await convertToModelMessages(messages);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // TODO:试着取消注释,看看会发生什么
      // writer.write({
      //   type: 'start',
      // });

      writeTextPart(writer, '第 1 段: ');

      const firstParagraphResult = streamText({
        model: openai.chat('gpt-5.5'),
        messages: [
          ...modelMessages,
          {
            role: 'user',

            content: [
              {
                type: 'text',
                text: '根据上面的对话历史,写出故事的第一段。写得短一点。',
              },
            ],
          },
        ],
      });

      writer.merge(
        toUIMessageStream({
          stream: firstParagraphResult.stream,
          // TODO:试着取消注释,看看会发生什么
          // sendStart: false,
          // sendFinish: false,
        }),
      );

      const firstParagraph = await firstParagraphResult.text;

      writeTextPart(writer, '第 2 段: ');

      const secondParagraphResult = streamText({
        model: openai.chat('gpt-5.5'),
        messages: [
          ...modelMessages,
          {
            role: 'user',

            content: [
              {
                type: 'text',

                text: `根据上面的对话历史,写出故事的第二段。写得短一点。
                这是第一段:
                ${firstParagraph}`,
              },
            ],
          },
        ],
      });

      writer.merge(
        toUIMessageStream({
          stream: secondParagraphResult.stream,
          // TODO:试着取消注释,看看会发生什么
          // sendStart: false,
          // sendFinish: false,
        }),
      );

      const secondParagraph = await secondParagraphResult.text;

      writeTextPart(writer, '第 3 段: ');

      const thirdParagraphResult = streamText({
        model: openai.chat('gpt-5.5'),
        messages: [
          ...modelMessages,
          {
            role: 'user',

            content: [
              {
                type: 'text',

                text: `根据上面的对话历史,写出故事的第三段。写得短一点。
                这是第一段:
                ${firstParagraph}
                这是第二段:
                ${secondParagraph}`,
              },
            ],
          },
        ],
      });

      writer.merge(
        toUIMessageStream({
          stream: thirdParagraphResult.stream,
          // TODO:试着取消注释,看看会发生什么
          // sendStart: false,
        }),
      );
    },
    onEnd: ({ messages }) => {
      console.dir(messages, { depth: null });
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
