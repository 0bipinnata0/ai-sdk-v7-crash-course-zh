import { openai } from '@ai-sdk/openai';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type UIMessage,
} from 'ai';

// TODO:把所有 UIMessage 实例替换为 MyMessage
export type MyMessage = UIMessage<
  unknown,
  {
    // TODO:在这里声明自定义数据部件
  }
>;

const formatMessageHistory = (messages: UIMessage[]) => {
  return messages
    .map((message) => {
      return `${message.role}: ${message.parts
        .map((part) => {
          if (part.type === 'text') {
            return part.text;
          }

          return '';
        })
        .join('')}`;
    })
    .join('\n');
};

const WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM = `你正在根据对话历史为用户写一条 Slack 消息。只返回 Slack 消息,不要其他文本。`;
const EVALUATE_SLACK_MESSAGE_SYSTEM = `你正在评估用户产出的 Slack 消息。

  评估标准:
  - Slack 消息应该写得易于理解。
  - 它应该适合专业的 Slack 对话场景。
`;
const WRITE_SLACK_MESSAGE_FINAL_SYSTEM = `你正在根据对话历史、初稿以及针对该初稿的反馈来写一条 Slack 消息。

  只返回最终的 Slack 消息,不要其他文本。
`;

export const POST = async (req: Request): Promise<Response> => {
  // TODO:改为 MyMessage[]
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      // TODO:通过 writer.write 写入一个 { type: 'start' } 消息
      TODO;

      // TODO - 改为 streamText,并作为自定义数据部件写入流
      const writeSlackResult = await generateText({
        model: openai.chat('gpt-5.5'),
        instructions: WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM,
        prompt: `
          对话历史:
          ${formatMessageHistory(messages)}
        `,
      });

      // TODO - 改为 streamText,并作为自定义数据部件写入流
      const evaluateSlackResult = await generateText({
        model: openai.chat('gpt-5.5'),
        instructions: EVALUATE_SLACK_MESSAGE_SYSTEM,
        prompt: `
          对话历史:
          ${formatMessageHistory(messages)}

          Slack 消息:
          ${writeSlackResult.text}
        `,
      });

      const finalSlackAttempt = streamText({
        model: openai.chat('gpt-5.5'),
        instructions: WRITE_SLACK_MESSAGE_FINAL_SYSTEM,
        prompt: `
          对话历史:
          ${formatMessageHistory(messages)}

          初稿:
          ${writeSlackResult.text}

          之前的反馈:
          ${evaluateSlackResult.text}
        `,
      });

      // TODO:把最终版 Slack 消息合并到流中,
      // 传入 sendStart: false
      writer.TODO;
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
