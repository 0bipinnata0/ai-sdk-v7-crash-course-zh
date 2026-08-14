import { promises as fs } from 'fs';
import { join } from 'path';
import type { UIMessage } from 'ai';

export namespace DB {
  // 持久层的类型
  export interface Chat {
    id: string;
    messages: UIMessage[];
    createdAt: string;
    updatedAt: string;
  }

  export interface PersistenceData {
    chats: DB.Chat[];
  }
}

// 存储数据的文件路径
const DATA_FILE_PATH = join(
  process.cwd(),
  'data',
  'chats.local.json',
);

/**
 * 确保数据目录存在
 */
async function ensureDataDirectory(): Promise<void> {
  const dataDir = join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

/**
 * 从 JSON 文件加载所有聊天
 */
export async function loadChats(): Promise<DB.Chat[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const parsed: DB.PersistenceData = JSON.parse(data);
    return parsed.chats || [];
  } catch (error) {
    // 如果文件不存在或无效,返回空数组
    return [];
  }
}

/**
 * 将所有聊天保存到 JSON 文件
 */
export async function saveChats(
  chats: DB.Chat[],
): Promise<void> {
  await ensureDataDirectory();
  const data: DB.PersistenceData = { chats };
  await fs.writeFile(
    DATA_FILE_PATH,
    JSON.stringify(data, null, 2),
    'utf-8',
  );
}

/**
 * 创建新聊天
 */
export async function createChat(
  id: string,
  initialMessages: UIMessage[] = [],
): Promise<DB.Chat> {
  const chats = await loadChats();
  const now = new Date().toISOString();

  const newChat: DB.Chat = {
    id,
    messages: initialMessages,
    createdAt: now,
    updatedAt: now,
  };

  chats.push(newChat);
  await saveChats(chats);

  return newChat;
}

/**
 * 按 ID 获取聊天
 */
export async function getChat(
  chatId: string,
): Promise<DB.Chat | null> {
  const chats = await loadChats();
  return chats.find((chat) => chat.id === chatId) || null;
}

/**
 * 更新聊天的消息
 */
export async function appendToChatMessages(
  chatId: string,
  messages: UIMessage[],
): Promise<DB.Chat | null> {
  const chats = await loadChats();
  const chatIndex = chats.findIndex(
    (chat) => chat.id === chatId,
  );

  if (chatIndex === -1) {
    return null;
  }

  chats[chatIndex]!.messages = [
    ...chats[chatIndex]!.messages,
    ...messages,
  ];
  chats[chatIndex]!.updatedAt = new Date().toISOString();

  await saveChats(chats);
  return chats[chatIndex]!;
}

/**
 * 删除聊天
 */
export async function deleteChat(
  chatId: string,
): Promise<boolean> {
  const chats = await loadChats();
  const initialLength = chats.length;
  const filteredChats = chats.filter(
    (chat) => chat.id !== chatId,
  );

  if (filteredChats.length === initialLength) {
    return false; // 聊天未找到
  }

  await saveChats(filteredChats);
  return true;
}
