AI SDK 允许你完全掌控流，真正把你自己自定义的数据部件流式传输到前端。

这在各种场景中都很有用，尤其是高级用例。但现在，我们先用它来做一件相当简单的事。

## 生成建议

使用 LLM 驱动的应用时，一个常见的模式是系统会为你提供"接下来可以问什么"的建议。我们要在应用中构建这个功能。

它的工作方式是：我们像平常一样使用 `streamText`，直接生成输出。

但一旦那个 `streamText` 调用完成，我们就开始另一个 `streamText` 调用。在第二次调用中，我们要把一个建议作为自定义数据部件追加到消息中。

我们要做的第一件事是在 `chat.ts` 中为建议数据部件定义一个类型。我们在这里声明一个自定义类型 `MyMessage`，它是一个自定义的 UI 消息：

```ts
export type MyMessage = UIMessage<
  never,
  {
    // TODO:定义建议数据部件的类型
    TODO: TODO;
  }
>;
```

基础的 `UIMessage` 类型支持各种不同的消息部件，比如：

- 文本
- 推理
- 文件
- 来源
- 工具调用和结果

但在这里，我们的计划是扩展它，创建一个叫做 `data-suggestion` 的新数据部件，它将包含一条关于用户接下来应该问什么的建议。查看[参考资料](/exercises/99-reference/99.04-custom-data-parts-streaming/explainer/readme.md)了解更多信息。

## 创建自定义消息流

你会注意到下面添加了更多基础设施。具体来说，`createUIMessageStream` 对我们来说是新东西。它允许我们创建自定义消息流，而不是只依赖单个 `streamText` 调用。

`writer` 变量，一个 `UIMessageStreamWriter`，有两个对我们非常重要的方法。

1. `merge`——允许我们把 streamText 结果的 UI 消息流合并到父 UI 消息流中。
2. `write`——我们将用它来写入自定义数据部件。

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    const streamTextResult = streamText({
      model: openai.chat('gpt-5.5'),
      messages: modelMessages,
    });

    writer.merge(streamTextResult.toUIMessageStream());

    await streamTextResult.consumeStream();

    // 更多关于建议的代码...
  },
});
```

`consumeStream` 允许我们消费流直到它被完全读取，这对于确保流结束很有用。查看[参考资料](/exercises/99-reference/99.03-consume-stream/explainer.1/readme.md)了解更多信息。

## 流式传输建议

消费完第一个流之后，我们再次调用 `streamText` 来获取后续建议：

```ts
const followupSuggestionsResult = streamText({
  model: openai.chat('gpt-5.5'),
  messages: [
    ...modelMessages,
    {
      role: 'assistant',
      content: await streamTextResult.text,
    },
    {
      role: 'user',
      content:
        '我接下来应该问什么问题?只返回问题文本。',
    },
  ],
});
```

我们不能做的是直接用这个结果再调用一次 `writer.merge`，因为那样第二个流的文本会直接追加到我们现有的文本后面，看起来就不对了。相反，我们需要以自定义数据部件的形式流式传输。

## 流式传输我们的自定义数据部件

代码看起来是这样的：

```ts
// 注意:为数据部件创建一个 id
const dataPartId = crypto.randomUUID();

// 注意:创建一个变量来存储完整的建议,
// 因为我们每次都需要存储完整的建议
let fullSuggestion = TODO;

for await (const chunk of followupSuggestionsResult.textStream) {
  // TODO:把 chunk 追加到完整建议中
  fullSuggestion += TODO;

  // TODO:调用 writer.write,把数据部件
  // 写入流中
  TODO;
}
```

首先，我们为数据部件创建一个 ID:`dataPartId`。

然后我们创建一个变量来存储完整的建议，因为随着流式传入，我们需要累积完整的建议文本。

我们遍历文本流（`followupSuggestionsResult.textStream`)，把每个 chunk 追加到完整建议中，并调用 `writer.write` 把数据部件写入流中。

到这里，在初始响应完成后，我们就会把建议流式传输下去了。

查看这两份参考资料了解更多信息：

- [向前端流式传输自定义数据部件](/exercises/99-reference/99.05-custom-data-parts-stream-to-frontend/explainer/readme.md)
- [为什么自定义数据部件需要 ID](/exercises/99-reference/99.06-custom-data-parts-id-reconciliation/explainer/readme.md)

## 在前端显示建议

我们的下一项工作是在前端显示它。代码现在看起来是这样的：

```tsx
const App = () => {
  const { messages, sendMessage } = useChat<MyMessage>({});

  const [input, setInput] = useState(``);

  // TODO:从最后一条消息中获取 data-suggestion 部件
  const latestSuggestion: string | undefined = TODO;

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
        // 注意:我们把建议传给 ChatInput 组件,
        // 在那里它会显示为一个按钮
        suggestion={
          messages.length === 0
            ? '法国的首都是哪里?'
            : latestSuggestion
        }
        input={input}
        onChange={(text) => setInput(text)}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({
            text: input,
          });
          setInput('');
        }}
      />
    </Wrapper>
  );
};
```

在 `latestSuggestion` 中，我们需要通过查找类型为 `data-suggestion` 的部件，从最后一条消息中获取建议。这会给我们一个 `string` 或 `undefined`（因为建议数据可能还没流传过来，或者我们可能还没有任何消息）。

然后我们把这个最新的建议放进 `ChatInput` 组件，在那里它会显示为一个按钮。

完成这一切之后，你应该能问一个问题，然后它会给你一个可以点击来接着问的后续建议。注意后续建议是如何漂亮地流式传入的，而不是一整块出现。

你还应该查看网络标签页，看看自定义数据部件是如何流式传入的——那总是很有趣！

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 在 [`chat.ts`](./api/chat.ts) 的 `MyMessage` 类型中定义建议数据部件的类型。查看[参考资料](/exercises/99-reference/99.04-custom-data-parts-streaming/explainer/readme.md)了解更多信息。

- [ ] 通过以下步骤完成建议流式传输的实现：
  - 把 `fullSuggestion` 变量初始化为空字符串
  - 在循环中把每个 chunk 追加到 `fullSuggestion`
  - 使用 `writer.write` 把累积的建议作为数据部件写入
  - 如有需要，使用参考资料：
    - [向前端流式传输自定义数据部件](/exercises/99-reference/99.05-custom-data-parts-stream-to-frontend/explainer/readme.md)
    - [为什么自定义数据部件需要 ID](/exercises/99-reference/99.06-custom-data-parts-id-reconciliation/explainer/readme.md)

- [ ] 在 [`root.tsx`](./client/root.tsx) 文件中，通过从最后一条消息中提取来实现 `latestSuggestion`

- [ ] 通过以下步骤测试你的实现：
  - 运行本地开发服务器
  - 问一个问题
  - 观察建议在主响应之后如何流式传入
  - 检查网络标签页，看看自定义数据部件是如何流式传输的
  - 点击建议按钮来问后续问题
