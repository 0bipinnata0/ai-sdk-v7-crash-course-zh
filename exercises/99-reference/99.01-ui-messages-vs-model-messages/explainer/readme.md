在使用 AI SDK 时，了解 `UIMessage` 消息和 `ModelMessage` 消息之间的区别非常重要。

- `UIMessage` 消息是在你的 UI 中显示的那些——也是你要持久化到数据库中的那些。
- `ModelMessage` 消息是发送给 LLM 的那些。

在一个典型的应用中，你会把一个 `UIMessage` 数组发送到你的 `POST` 路由（通常在 `api/chat`)，然后你需要把它们转换为模型消息，才能传给 AI SDK 的任何调用。

## `UIMessage`

`UIMessage` 消息看起来像这样。它们有一个 `role`、一个 `id`，以及一个 `parts` 数组。这些 parts 可以包含非常多种不同的内容，但目前，这个例子中的 parts 只包含文本。

```ts
const messages: UIMessage[] = [
  {
    role: 'user',
    id: '1',
    parts: [
      {
        type: 'text',
        text: '法国的首都是哪里?',
      },
    ],
  },
  // ...
```

这个例子有两条消息。我们有一条 role 为 `user` 的消息，另一条 role 为 `assistant`。

## `ModelMessage`

`ModelMessage` 消息是发送给 LLM 的那些。它们去掉了每条消息的 ID，因为 LLM 不关心这个；并且不再有 parts，而只有一个内容数组。

我们可以使用 `convertToModelMessages` 函数把 `UIMessage` 消息转换为 `ModelMessage` 消息。

```ts
const modelMessages = await convertToModelMessages(messages);
```

输出看起来像这样：

```ts
[
  {
    role: 'user',
    content: [
      { type: 'text', text: '法国的首都是哪里?' },
    ],
  },
  {
    role: 'assistant',
    content: [
      { type: 'text', text: '法国的首都是巴黎。' },
    ],
  },
];
```

我建议你试着探索一下 `UIMessage` 内部的类型。试着在这里添加一些不同的 parts，多运行几次这个练习，看看经过 `convertToModelMessages` 处理后它们会变成什么样。

## 完成步骤

- [ ] 打开我们的 [`main.ts`](./main.ts) 文件来探索代码

- [ ] 尝试修改 `UIMessage` 的 parts 数组，包含不同类型的内容

- [ ] 例如，添加一个图片 URL、一个工具调用，或其他内容类型

- [ ] 运行代码，看看 `convertToModelMessages` 如何把你修改后的 UI 消息转换为模型消息

- [ ] 在 parts 数组中试验不同的内容类型组合

- [ ] 观察终端输出，理解转换是如何工作的

- [ ] 试着在运行代码之前预测转换的结果会是什么样
