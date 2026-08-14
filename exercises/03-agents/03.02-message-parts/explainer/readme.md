在本练习中，我们将探索从后端流式传输到前端时，`UIMessage` 对象是如何构成的。让我们深入了解消息的表示方式以及它们包含的内容。

## 设置

我们使用之前练习中的一个简化示例，把它放进自己的 [`main.ts`](./main.ts) 文件中。代码设置为用所有先前定义的工具运行一次 [`streamText`](./main.ts) 调用，但现在我们要把流转换为 `UIMessageStream` 并打印到控制台。

这个流遵循我们熟悉的模式，有 `start`、`finish`、`text-delta`、`text-start` 和 `text-end` 等事件。但我们还会通过 [`onEnd`](./main.ts) 回调来检查消息的最终形态。

```ts
const result = streamText({
  // 模型和提示词的配置
  // ...
  stopWhen: [isStepCount(10)],
});

const stream = result.toUIMessageStream({
  onEnd: ({ messages }) => {
    console.log('--- ON FINISH ---');
    console.dir(messages, { depth: null });
  },
});

console.log('--- STREAM ---');

for await (const message of stream) {
  console.log(message);
}
```

## `UIMessageStream` 中的工具调用

运行这段代码时，我们可以看到流事件逐个展开。这个过程以 `start` 事件开始，接着是 `start-step` 事件。每一步都计入我们的 `stopWhen` 条件，通常代表一次工具调用。

流向我们展示了工具事件的详细过程：

```ts
{
  type: 'tool-input-start',
  toolCallId: 'mjDMqVhIzJMwcC22',
  toolName: 'writeFile',
  providerExecuted: undefined
}
```

这表明工具正在以特定的 `toolCallId` 和工具名被调用。`tool-input-delta` 显示输入正在被逐步构建。

```ts
{
  type: 'tool-input-delta',
  toolCallId: 'mjDMqVhIzJMwcC22',
  inputTextDelta: `{"path":"pirate.md","content":"A salty dog with a patch on his eye,\\nSailed the seas under a stormy sky.\\n..."}`
}
```

`tool-input-available` 事件表明完整的输入现在可用了。

```ts
{
  type: 'tool-input-available',
  toolCallId: 'mjDMqVhIzJMwcC22',
  toolName: 'writeFile',
  input: {
    path: 'pirate.md',
    content: 'A salty dog with a patch on his eye,\n' +
      // 完整的海盗诗内容
  },
  providerExecuted: undefined,
  providerMetadata: undefined
}
```

`tool-output-available` 事件显示工具执行的结果。

```ts
{
  type: 'tool-output-available',
  toolCallId: 'mjDMqVhIzJMwcC22',
  output: {
    success: true,
    message: '文件写入成功:pirate.md',
    path: 'pirate.md'
  },
  providerExecuted: undefined
}
```

工具完成后，我们结束这一步并开始新的一步，在这一步中向前端流式输出文本：

```ts
{ type: 'text-start', id: '0' }
{ type: 'text-delta', id: '0', delta: '我' }
{
  type: 'text-delta',
  id: '0',
  delta: "写了一首关于海盗的诗,并把它保存到了名为 `pir"
}
{ type: 'text-delta', id: '0', delta: 'ate.md` 的文件中。' }
{ type: 'text-end', id: '0' }
```

## `UIMessage` 中的 `parts`

但最有趣的部分发生在流完成之后。`onEnd` 回调给了我们 `UIMessage` 的最终形态，也就是前端应用中 `useChat` 会使用的东西。

在最终的 `UIMessage` 结构中，所有流式传输的部件都被收集到一条 `assistant` 消息中。

这里的关键属性是 `parts` 数组，它把所有流式块收集成一个干净、易读的结构：

1. `step-start` - 标记一步的开始
2. `tool-writeFile` - 包含工具调用的输入和输出
3. 又一个 `step-start` - 开始新的一步
4. `text` - 最终的文本响应

```ts
[
  {
    id: '',
    metadata: undefined,
    role: 'assistant',
    parts: [
      { type: 'step-start' },
      {
        type: 'tool-writeFile',
        toolCallId: 'mjDMqVhIzJMwcC22',
        state: 'output-available',
        input: {
          path: 'pirate.md',
          content: '...', // 海盗诗内容
        },
        output: {
          success: true,
          message: '文件写入成功:pirate.md',
          path: 'pirate.md',
        },
        // 其他属性
      },
      { type: 'step-start' },
      {
        type: 'text',
        text: '我写了一首关于海盗的诗,并把它保存到了名为 `pirate.md` 的文件中。',
        state: 'done',
      },
    ],
  },
];
```

这种结构化格式让持久化消息和在前端适当渲染它们变得容易得多。

你可以尝试修改提示词，观察它如何影响流事件和最终的 `UIMessage` 结构。

## 完成步骤

- [ ] 打开 [`main.ts`](./main.ts) 文件，查看 [`streamText`](./main.ts) 函数的现有实现，以及它是如何被转换为 `UIMessageStream` 的。

- [ ] 尝试修改提示词来请求不同类型的内容，也许换一个诗歌主题或不同的文件格式。

- [ ] 运行练习并观察控制台输出。

- [ ] 将流式事件与 `onEnd` 回调中最终的 `UIMessage` 结构进行对比。

- [ ] 用不同的提示词做实验，看看它们如何影响工具的使用和最终的 `UIMessage` 结构。
