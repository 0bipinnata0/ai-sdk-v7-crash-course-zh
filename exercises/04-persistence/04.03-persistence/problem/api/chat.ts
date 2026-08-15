import {
  convertToModelMessages,
  streamText,
  type UIMessage,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  createChat,
  getChat,
  appendToChatMessages,
} from './persistence-layer.ts';

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[]; id: string } =
    await req.json();
  const { messages, id } = body;

  const mostRecentMessage = messages[messages.length - 1];

  if (!mostRecentMessage) {
    return new Response('未提供消息', { status: 400 });
  }

  if (mostRecentMessage.role !== 'user') {
    return new Response('最后一条消息必须来自用户', {
      status: 400,
    });
  }

  const chat = TODO; // TODO:获取现有聊天

  if (!chat) {
    // TODO:如果聊天不存在,用这个 id 创建它
  } else {
    // TODO:否则,把最新消息追加到聊天中
  }

  // TODO:等待流完成,并把最后一条消息
  // 追加到聊天中
  const result = streamText({
    model: openai.chat('gpt-5.5'),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
};

// http://localhost:3000/api/chat?chatId=123
export const GET = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const chatId = url.searchParams.get('chatId');

  if (!chatId) {
    return new Response('未提供 chatId', { status: 400 });
  }

  const chat = await getChat(chatId);

  return new Response(JSON.stringify(chat), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
