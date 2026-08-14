在本节中，我们将研究如何把消息持久化到数据库。工作方式是：等待流完成，然后把创建的消息上传到数据库。

然而，在 AI SDK 中等待消息完成并不是那么简单。有几个属性看起来相似，但作用有微妙的差别。让我们来揭开它们的神秘面纱。

我们的设置是：在 POST 路由内部，我们正在做一些 [`streamText`](./api/chat.ts) 处理：

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const result = streamText({
    model: openai.chat('gpt-5.5'),
    messages: await convertToModelMessages(messages),
    onEnd: ({ response }) => {
      console.log('streamText.onEnd');
      console.log('  response.messages');
      console.dir(response.messages, { depth: null });
    },
  });

  // 更多代码...
};
```

我们从请求体中取出 UI 消息，把它们转换为模型消息后传给 `streamText` 函数。

然后我们有多个 [`onEnd`](./api/chat.ts) 回调：

1. 一个在 [`streamText`](./api/chat.ts) 内部，打印 `response.messages`
2. 另一个在 [`toUIMessageStreamResponse`](./api/chat.ts) 内部，打印 `messages` 和 `responseMessage`

```ts
return result.toUIMessageStreamResponse({
  originalMessages: messages,
  onEnd: ({ messages, responseMessage }) => {
    console.log('toUIMessageStreamResponse.onEnd');
    console.log('  messages');
    console.dir(messages, { depth: null });

    console.log('toUIMessageStreamResponse.onEnd');
    console.log('  responseMessage');
    console.dir(responseMessage, { depth: null });
  },
});
```

当我们与 UI 交互并问"给我写一首关于一条叫 Grant 的鱼的诗"时，我们会在终端中得到几条日志。

让我们来看看这三种响应类型之间的区别：

| 响应类型                                                 | 描述                                          | 内容                                                | 是否适合持久化             |
| -------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------- | -------------------------- |
| `streamText > onEnd > response.messages`              | 模型消息(AssistantModelMessage 或 ToolModelMessage) | 信息最少，没有 UI 数据                              | 不适合 UI 应用             |
| `toUIMessageStreamResponse > onEnd > messages`        | 完整消息历史                                  | 包括原始用户消息和助手响应（含所有部件）            | 持久化整个对话的理想选择   |
| `toUIMessageStreamResponse > onEnd > responseMessage` | 单条消息                                      | 只有新生成的助手消息                                | 适合只持久化最新响应       |

根据你想如何管理持久化，你可能会使用完整的消息历史，或者只使用最终生成的消息。

`toUIMessageStreamResponse.onEnd.messages` 中的完整消息历史包含所有部件，包括状态信息（start、done)，适合持久化整个对话。

总结一下：

- `streamText.onEnd` 有 `response.messages`（模型消息）——不适合持久化 UI 数据
- `toUIMessageStreamResponse.onEnd` 有完整的 `messages` 历史（特别是当你传入 originalMessages 时）
- `toUIMessageStreamResponse.onEnd` 还有 `responseMessage`，即新生成的那条消息

## 完成步骤

- [ ] 查看代码，理解回调中可用的三种不同消息格式之间的区别

- [ ] 通过运行本地开发服务器并检查消息是否被正确打印来测试你的实现

- [ ] 试着进行更长的对话，看看不同的消息格式在多次交换中如何变化
