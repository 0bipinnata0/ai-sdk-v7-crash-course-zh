import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type ModelMessage,
  type UIMessage,
} from 'ai';
import { langfuse } from './langfuse.ts';

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: UIMessage[] = body.messages;

  const modelMessages: ModelMessage[] =
    await convertToModelMessages(messages);

  const trace = langfuse.trace({
    sessionId: body.id,
  });

  const mostRecentMessage = messages[messages.length - 1];

  if (!mostRecentMessage) {
    return new Response('未提供消息', { status: 400 });
  }

  const mostRecentMessageText = mostRecentMessage.parts
    .map((part) => {
      if (part.type === 'text') {
        return part.text;
      }
      return '';
    })
    .join('');

  const titleResult = generateText({
    model: google('gemini-2.5-flash-lite'),
    prompt: `
      你是一个乐于助人的助手,可以为对话生成标题。

      <conversation-history>
      ${mostRecentMessageText}
      </conversation-history>

      找到能抓住对话精髓的最简洁标题。
      标题最多 30 个字符。
      标题使用书面语风格。结尾不要句号。
      不要使用标点符号或表情符号。
      如果对话中使用了缩写词,在标题中使用它们。
      在标题中使用正式的措辞,比如“故障排查”、“讨论”、“支持”、“选择”、“调研”等。
      由于列表中的所有条目都是对话,标题中不要使用“聊天”、“对话”或“讨论”这些词——UI 已经隐含了这一点。
      标题将用于在聊天应用中组织对话。

      为这段对话生成一个标题。
      只返回标题。
    `,
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'title-generation',
      metadata: {
        langfuseTraceId: trace.id,
      },
    },
  });

  const streamTextResult = streamText({
    model: google('gemini-2.5-flash'),
    messages: modelMessages,
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'chat',
      metadata: {
        langfuseTraceId: trace.id,
      },
    },
  });

  const stream = streamTextResult.toUIMessageStream({
    onFinish: async () => {
      const title = await titleResult;

      console.log('标题: ', title.text);

      await langfuse.flushAsync();
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
