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

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyMessage[] } = await req.json();
  const { messages } = body;

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      writer.write({
        type: 'start',
      });

      let step = 0;
      let mostRecentDraft = '';
      let mostRecentFeedback = '';

      while (step < 2) {
        // 写 Slack 消息
        const writeSlackResult = streamText({
          model: google('gemini-2.5-flash'),
          system: WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM,
          prompt: `
          对话历史:
          ${formatMessageHistory(messages)}

          Previous draft (if any):
          ${mostRecentDraft}

          之前的反馈(如有):
          ${mostRecentFeedback}
        `,
        });

        const draftId = crypto.randomUUID();

        let draft = '';

        for await (const part of writeSlackResult.textStream) {
          draft += part;

          writer.write({
            type: 'data-slack-message',
            data: draft,
            id: draftId,
          });
        }

        mostRecentDraft = draft;

        // 评估 Slack 消息
        const evaluateSlackResult = streamText({
          model: google('gemini-2.5-flash'),
          system: EVALUATE_SLACK_MESSAGE_SYSTEM,
          prompt: `
            对话历史:
            ${formatMessageHistory(messages)}

            Most recent draft:
            ${mostRecentDraft}

            之前的反馈(如有):
            ${mostRecentFeedback}
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

        mostRecentFeedback = feedback;

        step++;
      }

      const textPartId = crypto.randomUUID();

      writer.write({
        type: 'text-start',
        id: textPartId,
      });

      writer.write({
        type: 'text-delta',
        delta: mostRecentDraft,
        id: textPartId,
      });

      writer.write({
        type: 'text-end',
        id: textPartId,
      });
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
