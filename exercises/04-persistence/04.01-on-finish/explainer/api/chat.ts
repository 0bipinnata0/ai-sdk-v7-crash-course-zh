import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai';

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: await convertToModelMessages(messages),
    onFinish: ({ response }) => {
      // 'response.messages' 是一个 ToolModelMessage 和 AssistantModelMessage 的数组,
      // 它们是在流式传输过程中生成的模型消息。
      // 如果你不需要 UIMessage,这很有用——适用于更简单的应用。
      console.log('streamText.onFinish');
      console.log('  response.messages');
      console.dir(response.messages, { depth: null });
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: ({ messages, responseMessage }) => {
      // 'messages' 是完整的消息历史,包括你通过
      // originalMessages 传入的原始消息。
      console.log('toUIMessageStreamResponse.onFinish');
      console.log('  messages');
      console.dir(messages, { depth: null });

      // 'responseMessage' 是消息历史中的最后一条消息。
      console.log('toUIMessageStreamResponse.onFinish');
      console.log('  responseMessage');
      console.dir(responseMessage, { depth: null });
    },
  });
};
