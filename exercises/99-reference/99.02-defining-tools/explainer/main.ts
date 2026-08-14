import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { styleText } from 'node:util';
import { z } from 'zod';

const result = streamText({
  model: google('gemini-2.5-flash'),
  prompt: '把消息“你好,世界!”打印到控制台',
  tools: {
    logToConsole: tool({
      description: '把一条消息打印到控制台',
      inputSchema: z.object({
        message: z
          .string()
          .describe('要打印到控制台的消息'),
      }),
      execute: async ({ message }) => {
        console.log(styleText(['green', 'bold'], message));

        return '消息已打印到控制台';
      },
    }),
  },
});

for await (const chunk of result.toUIMessageStream()) {
  console.log(chunk);
}
