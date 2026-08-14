AI SDK v6 引入了一种构建智能体的新方式——[`ToolLoopAgent`](https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent) 类。这种方式将智能体的定义与调用分离开来，让你的代码更模块化、更易于分发。

你不再直接带着工具调用 [`streamText()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text)，而是先创建一个智能体实例，然后使用 [`createAgentUIStreamResponse()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/create-agent-ui-stream-response) 来调用它。这看起来像是多了几步，但它开启了在整个代码库中共享智能体、甚至将它们发布为包的可能性。

让我们探索一下这种新语法的工作方式，并与传统方式进行比较。

## 与 `streamText()` 的主要区别

### 系统提示词的变化

`system` 参数已更名为 `instructions`。这与 OpenAI 的术语更加一致。

此外，`instructions` 可以接受消息部件数组，让你可以用不同的角色来组织系统提示词：

```ts
instructions: [
  {
    role: 'system',
    content: '你是一个乐于助人的助手...',
  },
],
```

### 默认步数

默认停止条件发生了显著变化。

| 方式            | 默认 `stepCount` |
| --------------- | ---------------- |
| `streamText()`  | 1                |
| `ToolLoopAgent` | 20               |

默认情况下，`ToolLoopAgent` 表现得更像一个真正的智能体，最多运行 20 步才停止。你可以用 [`stopWhen`](https://ai-sdk.dev/docs/agents/loop-control) 参数来自定义这个行为。

## 完成步骤

- [ ] 观察智能体在 `api/chat.ts` 顶部是如何构建的

注意创建智能体的 [`ToolLoopAgent`](https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent) 实例，它只创建一次，传入模型、`instructions` 和 `tools`。

- [ ] 看看新的类型辅助工具是如何工作的

[`InferAgentUIMessage`](https://ai-sdk.dev/docs/agents/building-agents) 类型直接从智能体实例中提取消息类型，所以你不需要从工具手动构建类型。

```ts
export type MyAgentUIMessage = InferAgentUIMessage<typeof agent>;
```

- [ ] 观察智能体在 POST 处理器中是如何被调用的

智能体被传给 [`createAgentUIStreamResponse()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/create-agent-ui-stream-response)，它负责把智能体的响应流式传输回客户端。

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyAgentUIMessage[] } =
    await req.json();
  const { messages } = body;

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  });
};
```

- [ ] 注意组件是如何使用推断出的类型的

在 `client/root.tsx` 中，`useChat` hook 用推断出的 `MyAgentUIMessage` 类型标注，保持了与传统方式相同的人体工学体验。

```ts
const { messages, sendMessage } = useChat<MyAgentUIMessage>({});
```

- [ ] 看看如何以编程方式调用智能体

如果你想在 POST 请求之外调用智能体，可以使用 [`agent.generate()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent) 进行一次性文本生成，或使用 [`agent.stream()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent) 进行流式响应。

- [ ] 通过运行 `pnpm run dev` 在本地测试智能体

在浏览器中打开 `localhost:3000`，试着与智能体交互。试着提出类似"创建一个包含今天三项待办事项的 todo.md 文件"的请求，观察智能体如何使用它的文件系统工具来完成请求。你会在 UI 中看到工具调用的展示，清楚地显示智能体正在使用哪些工具。
