import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  type UIMessage,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from 'ai';
import { Experimental_StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';
import { createMCPClient } from '@ai-sdk/mcp';

if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
  throw new Error('GITHUB_PERSONAL_ACCESS_TOKEN is not set');
}

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  // TODO - 创建一个使用 StdioMCPTransport 的 MCP 客户端,
  // 连接到 GitHub MCP 服务器
  const mcpClient = TODO;

  const result = streamText({
    model: openai.chat('gpt-5.5'),
    messages: await convertToModelMessages(messages),
    instructions: `
      你是一个乐于助人的助手,可以使用 GitHub API 与用户的 GitHub 账户交互。
    `,
    // TODO - 使用 mcpClient.tools() 方法获取工具
    tools: TODO,
    stopWhen: [isStepCount(10)],
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      // TODO - 使用 mcpClient.close() 方法在流结束时关闭
      // MCP 客户端。这也会关闭运行 GitHub MCP 服务器的进程。
      onEnd: TODO,
    }),
  });
};
