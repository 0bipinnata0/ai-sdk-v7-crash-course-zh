import { openai } from '@ai-sdk/openai';
import {
  generateText,
  streamText,
  type UIMessage,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from 'ai';

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
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const writeSlackResult = TODO; // 写 Slack 消息

  const evaluateSlackResult = TODO; // 评估 Slack 消息

  const finalSlackAttempt = TODO; // 写最终版 Slack 消息

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: finalSlackAttempt.stream,
    }),
  });
};
