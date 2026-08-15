import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from 'ai';

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const result = streamText({
    model: openai.chat('gpt-5.5'),
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
    // TODO:把工具添加到 streamText 调用中
    tools: TODO,
    // TODO:给 streamText 调用添加一个自定义停止条件,
    // 强制智能体在执行 10 步后停止
    stopWhen: TODO,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
};
