如果我们的目标是持久化消息，我们需要某种"聊天"的概念。我们发送的每一条消息都是聊天线程的一部分，就像 ChatGPT 的工作方式一样。AI SDK 把这个作为一等概念，值得研究一下它是如何工作的。

事实上，AI SDK 做了一件相当出人意料的事。如果我说"你好，你好吗？"，然后查看请求负载，我们可以看到它已经随着消息一起发送了一个 ID:

```ts
// 请求负载示例
{
  messages: [...],
  id: "some-uuid-here"
}
```

这是出乎意料的行为！AI SDK 在前端生成一个 UUID，然后传给后端。这个后端 UUID 可以用来保存到数据库或更新现有聊天。

对于我们的用途来说，这种自动 ID 生成是有问题的，因为我们想自己控制 ID。假设我们正在查看某个特定聊天的 URL——我们希望 URL 中的聊天 ID 能流入我们的 API 聊天调用。

我在代码中设置了 [React Router](./client/root.tsx) 来帮助实现这一点：

```tsx
// 在 client/root.tsx 中
import { useSearchParams } from 'react-router';

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  console.log(searchParams.get('chatId'));

  // 组件其余部分...
};
```

这给了我们一个对搜索参数的最新引用。从中我取出 `chatId` 并打印到控制台。

当我们导航到 `localhost:3000?chatId=123` 时，可以看到 "123" 被打印到控制台。现在我们有了一个稳定的聊天 ID 引用。

你的任务是找到一种方法，把这个 ID 传入 `useChat` hook。

```tsx
const chatId = searchParams.get('chatId');

const { messages, sendMessage } = useChat({
  // TODO:把 chatId 传给 API 调用
});
```

祝你好运，我们解答部分见！

## 完成步骤

- [ ] 使用 `searchParams.get('chatId')` 从搜索参数中提取 `chatId`

- [ ] 把 `chatId` 传给 `useChat` hook 的选项对象（查看[文档](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence#loading-an-existing-chat)了解更多信息）

- [ ] 考虑添加一个兜底逻辑，以防 URL 中没有 `chatId`（使用 `crypto.randomUUID()`)

- [ ] 通过导航到 `localhost:3000?chatId=123` 测试你的方案

- [ ] 检查服务器控制台日志，验证你指定的 `chatId` 已被接收

- [ ] 尝试刷新页面，确认聊天以相同的 ID 保持连续性
