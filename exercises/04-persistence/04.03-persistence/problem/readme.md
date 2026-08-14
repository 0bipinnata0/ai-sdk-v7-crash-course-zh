好，我们旅程的下一步是把从 LLM 得到的消息和我们自己的用户消息真正持久化到某种数据库中。为了免去你搭建 Postgres 数据库的麻烦，我为你准备了一个持久层。

## 理解持久层

这个持久层有几个你需要了解的函数：

```ts
// 可用的函数
loadChats();
saveChats();
createChat();
getChat();
appendToChatMessages();
deleteChat();
```

你主要需要了解的是这两个：

- `getChat`：获取聊天及其关联的消息
- `appendToChatMessages`：接受一个 `chatId` 和一些消息，把它们追加到聊天历史中

### 待办：

- 查看所有可用的持久化函数
- 重点学习如何使用 `getChat` 和 `appendToChatMessages`

## 前端代码结构

让我们先看看前端。我添加了一个 `backupChatId` 状态：

```tsx
// 这为创建新聊天时提供一个稳定的 chatId
const [backupChatId, setBackupChatId] = useState(
  crypto.randomUUID(),
);
const [searchParams, setSearchParams] = useSearchParams();

const chatIdFromSearchParams = searchParams.get('chatId');
```

思路是：当我们在 `localhost:3000` 且 URL 中没有任何 `chatId` 时，我们希望传入一个有效且稳定的 `chatId`——一个不会在每次渲染时变化的 ID。

我还添加了从后端获取聊天的 React Query 代码：

```tsx
const { data } = useSuspenseQuery({
  queryKey: ['chat', chatIdFromSearchParams],
  queryFn: () => {
    if (!chatIdFromSearchParams) {
      return null;
    }

    return fetch(
      `/api/chat?chatId=${chatIdFromSearchParams}`,
    ).then((res): Promise<DB.Chat> => res.json());
  },
});
```

这会从搜索参数中取出 `chatId`，并从 `/api/chat` 端点获取数据。

我们需要把 `chatId` 以及任何已存在的消息传给 `useChat` hook:

```tsx
// TODO:把 chatId 传给 useChat hook,
// 以及来自后端的任何已存在消息
const { messages, sendMessage } = useChat({});
```

### 待办：

- 更新 `useChat` hook，包含 `chatId`
- 把来自后端的已存在消息传给 `useChat` hook

## 后端实现

看看 `/api/chat` 的后端代码，`GET` 端点已经实现了。它只是从数据库中获取聊天：

```ts
export const GET = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const chatId = url.searchParams.get('chatId');

  if (!chatId) {
    return new Response('No chatId provided', { status: 400 });
  }

  const chat = await getChat(chatId);

  return new Response(JSON.stringify(chat), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
```

`POST` 端点是我们需要做大部分工作的地方：

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[]; id: string } =
    await req.json();
  const { messages, id } = body;

  const mostRecentMessage = messages[messages.length - 1];

  if (!mostRecentMessage) {
    return new Response('No messages provided', { status: 400 });
  }

  if (mostRecentMessage.role !== 'user') {
    return new Response('Last message must be from the user', {
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
    model: google('gemini-2.5-flash'),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
};
```

### 待办：

- 用 `getChat(id)` 实现获取现有聊天
- 如果聊天不存在，用 `createChat(id, messages)` 创建新聊天
- 如果聊天存在，追加最新消息
- 修改 `result.toUIMessageStreamResponse()` 来保存 AI 的响应消息

## 表单提交更新

最后，我们需要更新表单提交处理器：

```tsx
onSubmit={(e) => {
  e.preventDefault();
  sendMessage({
    text: input,
  });
  setInput('');

  // TODO:如果 chatId 还没设置,
  // 把搜索参数设置为新的 chatId

  // TODO:如果 chatId 还没设置,
  // 刷新备用 chatId
}}
```

## 完成步骤

- [ ] 修改前端的 `useChat` hook 调用，包含 `chatId`（来自 URL 或备用 ID）以及来自后端的任何已存在消息。你可以通过探索传给 `useChat` 的选项对象的自动补全来弄清楚怎么做。

- [ ] 更新表单提交处理器：
  - 创建新聊天时，用 chatId 设置搜索参数
  - 创建新聊天时，刷新备用 chatId

- [ ] 在后端 POST 处理器中：
  - 用 `getChat(id)` 实现获取现有聊天
  - 如果聊天不存在，用 `createChat(id, messages)` 创建
  - 如果聊天存在，用 `appendToChatMessages` 追加最新消息
  - 修改 `toUIMessageStreamResponse()`，使用 `onFinish` 回调保存 AI 响应消息

- [ ] 通过运行开发服务器并查看刷新页面后消息是否保持，来测试你的实现

- [ ] 测试新聊天是否在 URL 中获得唯一 ID

- [ ] 检查直接访问某个聊天 URL 时，之前的消息是否正确加载
