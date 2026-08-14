import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  type UIMessage,
} from 'ai';

import { createMCPClient } from '@ai-sdk/mcp';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';

if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
  throw new Error('GITHUB_PERSONAL_ACCESS_TOKEN is not set');
}

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const mcpClient = await createMCPClient({
    transport: new StdioMCPTransport({
      command: 'docker',
      args: [
        'run',
        '-i',
        '--rm',
        '-e',
        'GITHUB_PERSONAL_ACCESS_TOKEN',
        'ghcr.io/github/github-mcp-server',
      ],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN:
          process.env.GITHUB_PERSONAL_ACCESS_TOKEN!,
      },
    }),
  });

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: await convertToModelMessages(messages),
    instructions: `
      你是一个乐于助人的助手,可以使用 GitHub API 与用户的 GitHub 账户交互。
    `,
    tools: await mcpClient.tools(),
    stopWhen: [isStepCount(10)],
  });

  return result.toUIMessageStreamResponse({
    onEnd: async () => {
      await mcpClient.close();
    },
  });
};
