import { google } from '@ai-sdk/google';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from 'ai';

export type MyMessage = UIMessage<
  unknown,
  {
    'slack-message': string;
    'slack-message-feedback': string;
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
  const body: { messages: MyMessage[] } = await req.json();
  const { messages } = body;

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      writer.write({
        type: 'start',
      });

      let step = TODO; // TODO:记录当前在第几步
      let mostRecentDraft = TODO; // TODO:记录最近的草稿
      let mostRecentFeedback = TODO; // TODO:记录最近的反馈

      // TODO:创建一个循环,它:
      // 1. 写一条 Slack 消息
      // 2. 评估这条 Slack 消息
      // 3. 把反馈保存到上面的变量中
      // 4. 递增 step 变量

      // TODO:循环完成后,通过流式传输一个大的
      // 'text-delta' 部件来写出最终版 Slack 消息
      // (示例见参考资料)

      const writeSlackResult = streamText({
        model: google('gemini-2.5-flash'),
        instructions: WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM,
        prompt: `
          对话历史:
          ${formatMessageHistory(messages)}
        `,
      });

      const firstDraftId = crypto.randomUUID();

      let firstDraft = '';

      for await (const part of writeSlackResult.textStream) {
        firstDraft += part;

        writer.write({
          type: 'data-slack-message',
          data: firstDraft,
          id: firstDraftId,
        });
      }

      // 评估 Slack 消息
      const evaluateSlackResult = streamText({
        model: google('gemini-2.5-flash'),
        instructions: EVALUATE_SLACK_MESSAGE_SYSTEM,
        prompt: `
          对话历史:
          ${formatMessageHistory(messages)}

          Slack 消息:
          ${firstDraft}
        `,
      });

      const feedbackId = crypto.randomUUID();

      let feedback = '';

      for await (const part of evaluateSlackResult.textStream) {
        feedback += part;

        writer.write({
          type: 'data-slack-message-feedback',
          data: feedback,
          id: feedbackId,
        });
      }

      // 写最终版 Slack 消息
      const finalSlackAttempt = streamText({
        model: google('gemini-2.5-flash'),
        instructions: WRITE_SLACK_MESSAGE_FINAL_SYSTEM,
        prompt: `
          对话历史:
          ${formatMessageHistory(messages)}

          初稿:
          ${firstDraft}

          之前的反馈:
          ${feedback}
        `,
      });

      writer.merge(
        finalSlackAttempt.toUIMessageStream({
          sendStart: false,
        }),
      );
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
