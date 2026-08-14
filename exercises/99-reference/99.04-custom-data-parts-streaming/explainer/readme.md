在 AI SDK 中，你可以完全掌控从后端到前端的流，并且可以创建自己的自定义数据部件，用来流式传输自定义信息。

第一种做法是设置一个自定义消息类型：

```ts
type MyMessage = UIMessage<
  unknown,
  {
    hello: string;
    goodbye: string;
  }
>;
```

`UIMessage` 可以接收三个类型参数：metadata、数据部件和工具。我们这里关心的是数据部件，所以可以把 metadata 默认为 unknown，然后传入我们各个数据部件的映射表。

当我们向流写入时，会在 `writer.write` 调用中使用这个映射表的键。这创建了一个我们可以写入的消息流：

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    writer.write({
      type: 'data-hello',
      data: 'Bonjour!',
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-goodbye',
      data: 'Au revoir!',
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-hello',
      data: 'Guten Tag!',
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-goodbye',
      data: 'Auf Wiedersehen!',
    });
  },
});
```

这里的键代表我们写数据部件时要用的键。类型中的 "hello" 对应写入流时的 "data-hello","goodbye" 对应 "data-goodbye"。

然后我们把所有这些块打印到控制台：

```ts
for await (const chunk of stream) {
  console.log(chunk);
}
```

如果我们运行这个练习，会看到这个输出：

```
{ type: 'data-hello', data: 'Bonjour!' }
{ type: 'data-goodbye', data: 'Au revoir!' }
{ type: 'data-hello', data: 'Guten Tag!' }
{ type: 'data-goodbye', data: 'Auf Wiedersehen!' }
```

每个块在产生时就被打印出来，由于我们的 `setTimeout` 调用，它们之间有 1 秒的延迟。

当我们把它接到 UI 上时，我们会看到这些完全相同的数据部件也被流式传输到那里。

一旦我们创建了那个 `MyMessage` 类型，我们就可以创建一个 `UIMessageStream`，直接往里面写自定义内容。这些还可以与 streamText 调用交错进行，后者也可以合并进这个流。

干得漂亮，我们下一课见。
