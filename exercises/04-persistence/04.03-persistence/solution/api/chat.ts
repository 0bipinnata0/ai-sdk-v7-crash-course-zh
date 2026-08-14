import {
  convertToModelMessages,
  streamText,
  type UIMessage,
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

  let chat = await getChat(id);
  const mostRecentMessage = messages[messages.length - 1];

  if (!mostRecentMessage) {
    return new Response('未提供消息', { status: 400 });
  }

  if (mostRecentMessage.role !== 'user') {
    return new Response('最后一条消息必须来自用户', {
      status: 400,
    });
  }

  if (!chat) {
    const newChat = await createChat(id, messages);
    chat = newChat;
  } else {
    await appendToChatMessages(id, [mostRecentMessage]);
  }

  const result = streamText({
    model: openai.chat('gpt-5.5'),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    onEnd: async ({ responseMessage }) => {
      await appendToChatMessages(id, [responseMessage]);
    },
  });
};

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
