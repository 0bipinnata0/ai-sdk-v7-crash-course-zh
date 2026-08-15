import { openai } from '@ai-sdk/openai';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  Output,
  streamText,
  type UIMessage,
} from 'ai';
import { z } from 'zod';

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
          model: openai.chat('gpt-5.5'),
          instructions: WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM,
          prompt: `
          对话历史:
          ${formatMessageHistory(messages)}

          Previous draft (if any):
          ${mostRecentDraft}

          之前的反馈(如有):
          ${mostRecentFeedback}
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

        mostRecentDraft = firstDraft;

        // 评估 Slack 消息
        const evaluateSlackResult = streamText({
          model: openai.chat('gpt-5.5'),
          instructions: EVALUATE_SLACK_MESSAGE_SYSTEM,
          prompt: `
            对话历史:
            ${formatMessageHistory(messages)}

            Most recent draft:
            ${mostRecentDraft}

            之前的反馈(如有):
            ${mostRecentFeedback}
          `,
          output: Output.object({
            schema: z.object({
              feedback: z
                .string()
                .optional()
                .describe(
                  '关于最近草稿的反馈。仅在草稿不够好时返回。',
                ),
              isGoodEnough: z
                .boolean()
                .describe('最近的草稿是否足够好,可以停止循环。'),
            }),
          }),
        });

        const feedbackId = crypto.randomUUID();

        for await (const part of evaluateSlackResult.partialOutputStream) {
          if (part.feedback) {
            writer.write({
              type: 'data-slack-message-feedback',
              data: part.feedback,
              id: feedbackId,
            });
          }
        }

        const finalEvaluationObject =
          await evaluateSlackResult.output;

        // 如果草稿足够好,跳出循环
        if (finalEvaluationObject.isGoodEnough) {
          break;
        }

        if (!finalEvaluationObject.feedback) {
          throw new Error('LLM 没有提供反馈。');
        }

        mostRecentFeedback = finalEvaluationObject.feedback;

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
