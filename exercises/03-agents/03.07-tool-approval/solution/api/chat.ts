import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  tool,
  type InferUITools,
  type UIMessage,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from 'ai';
import { z } from 'zod';

const tools = {
  sendEmail: tool({
    description: '给收件人发送一封邮件',
    inputSchema: z.object({
      to: z.string().describe('收件人的邮箱地址'),
      subject: z.string().describe('邮件的主题'),
      body: z.string().describe('邮件的正文'),
    }),
    execute: async ({ to, subject, body }) => {
      // 在真实应用中,这里会发送邮件
      console.log(`正在发送邮件给 ${to}:${subject}`);
      return { sent: true, to, subject };
    },
  }),
};

export type MyUIMessage = UIMessage<
  never,
  never,
  InferUITools<typeof tools>
>;

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const result = streamText({
    model: openai.chat('gpt-5.5'),
    messages: await convertToModelMessages(messages),
    instructions: `
      你是一个乐于助人的邮件助手。你可以代表用户发送邮件。

      当用户要求你发送邮件时,使用 sendEmail 工具。
      发送前务必确认邮件详情。
    `,
    tools,
    toolApproval: {
      sendEmail: 'user-approval',
    },
    stopWhen: [isStepCount(10)],
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
};
