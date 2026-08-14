让我们来试试另一个有趣的模式：基于同一个问题产出多个输出，然后让用户选择他们更喜欢的那个。

生成多个输出对于 A/B 测试来说非常好。在我们的例子中，我们只是比较两个不同的模型，但你可能想比较两种完全不同的方案，并让用户选择哪个更好。这能给你带来极其有价值的数据。

## 设置

基本设置再次使用 `createUIMessageStream`，两个 `streamText` 调用并排在一起：

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    const firstStreamResult = streamText({
      model: google('gemini-2.5-flash-lite'),
      messages: modelMessages,
    });

    const secondStreamResult = streamText({
      model: google('gemini-2.5-flash'),
      messages: modelMessages,
    });

    // TODO:使用 Promise.all,为每个模型调用 streamModelText
    // 并传入相应的模型
    await Promise.all(TODO);
  },
});
```

两个流调用被传入完全相同的消息，但我们使用两个不同的模型——一个用 `gemini-2.5-flash-lite`，另一个用 `gemini-2.5-flash`。

就在这下面，我们需要用 `Promise.all` 为每个模型调用 `streamModelText`，并传入相应的模型。

## `streamModelText` 函数

那么，`streamModelText` 函数是什么？它在一个对象中接收三个参数：

- `textStream`：一个 `AsyncIterableStream<string>`
- `model`：一个 `string`
- `writer`：一个 `UIMessageStreamWriter<MyMessage>`

```ts
const streamModelText = async (opts: {
  textStream: AsyncIterableStream<string>;
  model: string;
  writer: UIMessageStreamWriter<MyMessage>;
}) => {
  // TODO:把 textStream 中的文本流式传输到
  // data-output 部件
};
```

在这里面，我们将用 `for await` 循环遍历文本流，并把文本写入 data-output 部件。查看[参考资料](/exercises/99-reference/99.05-custom-data-parts-stream-to-frontend/explainer/readme.md)复习一下如何做。

## 定义 `data-output` 部件

我们需要在 `MyMessage` 类型中定义 `data-output` 部件：

```ts
type MyMessage = UIMessage<
  never,
  {
    // TODO:在这里声明 data-output 类型。
    // 我们需要两个属性:
    // - model: string - 生成文本的模型名称
    // - text: string - 模型生成的文本
    output: TODO;
  }
>;
```

`data-output` 部件需要两个属性：

1. 一个字符串类型的 `model`（生成文本的模型名称）
2. 模型生成的 `text`

模型名称会展示给用户，所以我们希望它是人类可读的。

## 前端实现

现在让我们看看前端需要做什么。在顶层，我们有一个 `latestMessageIsAwaitingResponse` 布尔值，检查最新消息是否含有 data-output 部件：

```tsx
const latestMessage = messages[messages.length - 1];

// 注意:这检查最新消息是否正在等待
// 响应。如果是,我们要禁用输入框。
const latestMessageIsAwaitingResponse =
  latestMessage?.role === 'assistant' &&
  latestMessage.parts.some(
    (part) => part.type === 'data-output',
  );
```

如果是，我们想禁用聊天输入框。我们还会根据是否在等待响应来显示不同的占位文本：

```tsx
<ChatInput
  placeholder={
    latestMessageIsAwaitingResponse
      ? '请选择一个回复以继续...'
      : '说点什么...'
  }
  // ... 其他属性 ...
  disabled={latestMessageIsAwaitingResponse}
/>
```

## 实现模型选择回调

在 `Message` 组件内部，有一个 `onSelectModel` 回调：

```tsx
<Message
  onSelectModel={(partId) => {
    const part = message.parts
      .filter((part) => part.type === 'data-output')
      .find((part) => part.id === partId);

    if (!part) {
      return;
    }

    // TODO:onSelectModel 的目标是把两个
    // data-output 部件替换为单个文本部件——
    // 即我们选为最佳的那个输出。

    // TODO:这意味着我们需要更新 useChat 中的消息,
    // 用一个带有单个文本部件的新消息
    // 替换当前这条消息。

    // TODO:使用 messages.slice 取出当前消息
    // 之前的所有消息。
    const newMessages = TODO;

    // TODO:向 newMessages 数组推入一条新消息,
    // 它是当前消息的副本,但 data-output 部件
    // 被替换为了一个文本部件。
    newMessages.push(TODO);

    // TODO:把新消息数组设置为 useChat 中的消息
    // (useChat 返回一个 setMessages 函数)
    TODO;
  }}
/>
```

这个回调接收一个 `partId` 参数，并提取出它代表的部件。

目标是把两个 `data-output` 部件替换为单个文本部件——被选为最佳的那个输出。

当用户选择其中一个响应时，会调用 `onSelectModel` 回调。我们表示这个选择的方式是：把其中一个数据输出部件提升为普通的文本部件，它将在消息历史中作为正式回复保留下来。

具体来说，我们需要：

1. 使用 `messages.slice` 取出当前消息之前的所有消息
2. 向 `newMessages` 数组推入一条新消息，它是当前消息的副本，但 data-output 部件被替换为了一个文本部件
3. 把新消息数组设置为 `useChat` 中的消息（它会返回一个 `setMessages` 函数）

## 测试

完成之后，你应该能够：

1. 向你的系统提问
2. 看到两个响应
3. 选择其中一个响应
4. 以那个响应作为正式回复继续对话

试试一些数学问题或内容生成任务吧！祝你好运，我们解答部分见。

## 完成步骤

- [ ] 在 `MyMessage` 类型中定义 `data-output` 类型
  - 添加 `model: string` 和 `text: string` 属性

- [ ] 实现 `streamModelText` 函数
  - 使用 writer 把 `textStream` 中的文本流式传输到 data-output 部件

- [ ] 完成 execute 函数中的 `Promise.all` 调用
  - 为每个模型调用 `streamModelText` 并传入相应的参数

- [ ] 在前端实现 `onSelectModel` 回调
  - 使用 `messages.slice` 取出当前消息之前的所有消息（使用 `index` 参数）
  - 创建一个以选中输出作为文本部件的新消息
  - 使用 useChat 的 `setMessages` 函数更新消息数组

- [ ] 测试你的实现
  - 用 `pnpm run exercise` 运行练习
  - 打开 localhost:3000
  - 问一个问题，观察两个模型的响应
  - 选择一个响应，验证你可以继续对话
