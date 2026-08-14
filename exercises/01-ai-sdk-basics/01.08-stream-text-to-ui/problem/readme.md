现在，我们理解了流式传输文本的重要性，以及如何将来自 LLM 的文本流转换为供前端使用的 `UIMessageStream`。让我们看看如何在应用中实现它。

我们有一个小型的 Vite 应用，根组件在 [`client/root.tsx`](./client/root.tsx) 中。我们的第一个任务是使用 `useChat` hook 来获取 messages 和 sendMessage 函数，它将连接到预先构建好的消息渲染和聊天输入组件。

我们需要在 [`client/root.tsx`](./client/root.tsx) 的 App 组件中实现 `TODO`:

```tsx
import { useChat } from '@ai-sdk/react';

const App = () => {
  // TODO:使用 useChat hook 获取 messages 和 sendMessage 函数
  const { messages, sendMessage } = TODO;

  const [input, setInput] = useState(
    `法国的首都是哪里?`,
  );

  return (
    <Wrapper>
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          parts={message.parts}
        />
      ))}
      <ChatInput
        input={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={(e) => {
          e.preventDefault();
          // TODO:发送消息
        }}
      />
    </Wrapper>
  );
};
```

设置好前端之后，我们需要处理 [`api/chat.ts`](./api/chat.ts) 中的 API 路由。这个 `POST` 路由会在用户发送消息时被调用，并发送到目前为止收集的所有消息的完整历史。

API 路由有几个 TODO 需要完成：

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  // TODO:从 body 中获取 UIMessage[]
  const messages: UIMessage[] = TODO;

  // TODO:将 UIMessage[] 转换为 ModelMessage[]
  const modelMessages: ModelMessage[] = TODO;

  // TODO:将 modelMessages 传给 streamText
  const streamTextResult = streamText({
    model: google('gemini-2.5-flash'),
  });

  // TODO:从 streamTextResult 创建一个 UIMessageStream
  const stream = TODO;

  return createUIMessageStreamResponse({
    stream,
  });
};
```

在网络标签页中检查请求时，你会发现 `body.messages` 包含一个 `UIMessage` 数组。要把这些发送给 `streamText`，我们首先需要使用 `ai` 包中的一个函数将它们从 `UIMessage` 转换为 `ModelMessage`。查看[参考资料](/exercises/99-reference/99.01-ui-messages-vs-model-messages/explainer/readme.md)了解更多信息。

完成所有这些步骤后，你就能与 Gemini 模型进行完整的对话了——不只是单次的问答，而是一场不断演进的对话，LLM 会在所有先前的消息之上保持上下文。

## 完成步骤

- [ ] 在 `client/root.tsx` 中从 `@ai-sdk/react` 导入 `useChat` hook

- [ ] 用适当的 `useChat({})` 调用替换 App 组件中的 `TODO`

- [ ] 完成 `ChatInput` 中的 `onSubmit` 处理器，使用 `sendMessage` 发送输入文本

- [ ] 在 `api/chat.ts` 中，从请求体中提取 `UIMessage`（替换第一个 `TODO`)

- [ ] 导入并使用一个函数将 `UIMessage` 转换为 `ModelMessage`（替换第二个 `TODO`)

- [ ] 通过将 `ModelMessage` 添加到现有配置中，把它们传给 `streamText` 函数

- [ ] 从 `streamText` 的结果创建一个 `UIMessageStream`（替换第四个 `TODO`)

- [ ] 通过运行开发服务器并与 AI 对话来测试你的实现

- [ ] 检查网络标签页，确保消息被正确发送和流式传输。注意 `UIMessageStream` 是如何被发送到前端的。
