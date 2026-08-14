有时你不仅想流式传输自定义部件，还想手动流式传输 AI SDK 的内置部件来模拟它们。我这里具体指的是手动流式传输文本部件。

这会出现在一些边界场景中：你想让某个东西看起来像一次 LLM 调用，但它实际上不是 LLM 调用；或者你有一些并行准备好的数据，想一次性全部输出。

要做到这一点，我们将使用 `createUIMessageStream` 创建一个 `UIMessageStream`:

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    const textPartId = crypto.randomUUID();

    writer.write({
      type: 'text-start',
      id: textPartId,
    });

    const splitText = text.split(' ');

    for (const word of splitText) {
      writer.write({
        type: 'text-delta',
        delta: word + ' ',
        id: textPartId,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    writer.write({
      type: 'text-end',
      id: textPartId,
    });
  },
});
```

对于文本流式传输，有一个你需要遵循的特定顺序。你以 `text-start` 事件开始，然后为每段文本发送多个 `text-delta` 事件，最后用一个 `text-end` 事件来完成这个序列。

这些消息部件需要共享同一个 ID（在本例中是 `textPartId`)，它用 `crypto.randomUUID()` 生成。

文本被拆分成单词，每个单词作为一个单独的 delta 发送，并带一点延迟来制造流式效果：

```ts
const splitText = text.split(' ');

for (const word of splitText) {
  writer.write({
    type: 'text-delta',
    delta: word + ' ',
    id: textPartId,
  });

  await new Promise((resolve) => setTimeout(resolve, 50));
}
```

当你想模拟 AI SDK 的某个部件，或者只是想手动流式传输一些文本时，这种方式非常好用。你可以在我们的 [`main.ts`](./main.ts) 文件中看到完整的示例。

干得漂亮，我们下一课见。
