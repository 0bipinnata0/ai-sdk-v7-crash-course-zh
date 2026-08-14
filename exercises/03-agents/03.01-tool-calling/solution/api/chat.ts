import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  tool,
  type UIMessage,
} from 'ai';
import { z } from 'zod';
import * as fsTools from './file-system-functionality.ts';

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: await convertToModelMessages(messages),
    instructions: `
      你是一个乐于助人的助手,可以使用沙箱文件系统来创建、编辑和删除文件。

      你可以使用以下工具:
      - writeFile
      - readFile
      - deletePath
      - listDirectory
      - createDirectory
      - exists
      - searchFiles

      使用这些工具为用户记录笔记、创建待办事项列表和编辑文档。

      使用 markdown 文件来存储信息。
    `,
    tools: {
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
          path: z
            .string()
            .describe('要读取的文件的路径'),
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
            .describe(
              '要删除的文件或目录的路径',
            ),
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
      createDirectory: tool({
        description: '创建目录',
        inputSchema: z.object({
          path: z
            .string()
            .describe('要创建的目录的路径'),
        }),
        execute: async ({ path }) => {
          return fsTools.createDirectory(path);
        },
      }),
      exists: tool({
        description: '检查文件或目录是否存在',
        inputSchema: z.object({
          path: z
            .string()
            .describe(
              '要检查的文件或目录的路径',
            ),
        }),
        execute: async ({ path }) => {
          return fsTools.exists(path);
        },
      }),
      searchFiles: tool({
        description: '搜索文件',
        inputSchema: z.object({
          pattern: z
            .string()
            .describe('要搜索的模式'),
        }),
        execute: async ({ pattern }) => {
          return fsTools.searchFiles(pattern);
        },
      }),
    },
    stopWhen: [isStepCount(10)],
  });

  return result.toUIMessageStreamResponse();
};
