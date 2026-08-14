import { google } from '@ai-sdk/google';
import {
  createAgentUIStreamResponse,
  type InferAgentUIMessage,
  isStepCount,
  tool,
  ToolLoopAgent,
} from 'ai';
import { z } from 'zod';
import * as fsTools from './file-system-functionality.ts';

const tools = {
  writeFile: tool({
    description: '写入文件',
    inputSchema: z.object({
      path: z
        .string()
        .describe('要创建的文件的路径'),
      content: z
        .string()
        .describe('要创建的文件的内容'),
    }),
    execute: async ({ path, content }) => {
      return fsTools.writeFile(path, content);
    },
  }),
  readFile: tool({
    description: '读取文件',
    inputSchema: z.object({
      path: z.string().describe('要读取的文件的路径'),
    }),
    execute: async ({ path }) => {
      return fsTools.readFile(path);
    },
  }),
  deletePath: tool({
    description: '删除文件或目录',
    inputSchema: z.object({
      path: z
        .string()
        .describe('要删除的文件或目录的路径'),
    }),
    execute: async ({ path }) => {
      return fsTools.deletePath(path);
    },
  }),
  listDirectory: tool({
    description: '列出目录',
    inputSchema: z.object({
      path: z
        .string()
        .describe('要列出的目录的路径'),
    }),
    execute: async ({ path }) => {
      return fsTools.listDirectory(path);
    },
  }),
};

const agent = new ToolLoopAgent({
  model: google('gemini-2.5-flash'),
  instructions: `
    你是一个乐于助人的助手,可以使用沙箱文件系统来创建、编辑和删除文件。

    你可以使用以下工具:
    - writeFile
    - readFile
    - deletePath
    - listDirectory

    使用这些工具为用户记录笔记、创建待办事项列表和编辑文档。

    使用 markdown 文件来存储信息。
  `,
  tools,
});

export type MyAgentUIMessage = InferAgentUIMessage<typeof agent>;

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyAgentUIMessage[] } =
    await req.json();
  const { messages } = body;

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  });
};
