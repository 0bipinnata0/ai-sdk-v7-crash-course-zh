我想帮你诊断一个当你一个接一个地流式传输多个内容时会出现的问题。这里我们一次流式传输故事的一个段落。在每个段落之前，我们会写入"第 1 段"、"第 2 段"和"第 3 段"。

## 理解代码

在[代码](./api/chat.ts)中，我们在一个 `UIMessageStream` 内部。我们有一个 `writeTextPart` 函数，它本质上只是写入单个文本部件。

```typescript
const writeTextPart = (
  writer: UIMessageStreamWriter,
  text: string,
) => {
  const textPartId = crypto.randomUUID();
  writer.write({
    type: 'text-start',
    id: textPartId,
  });
  writer.write({
    type: 'text-delta',
    id: textPartId,
    delta: text,
  });
  writer.write({
    type: 'text-end',
    id: textPartId,
  });
};
```

如果你不知道这段代码是干什么的，有[其他参考资料](/exercises/99-reference/99.08-streaming-text-parts-by-hand/explainer/readme.md)解释了它。

## 多个流的问题

在我们的主流执行中，我们：

1. 写入"第 1 段："文本
2. 流式传输第一段的结果
3. 把那个流合并到父流中
4. 等待第一段的文本，并把它传给第二段的流
5. 写入第二段的标题
6. 流式传输文本
7. 把它合并进来

我们这样重复三次，直到有三个段落。这是第一段的代码：

```ts
writeTextPart(writer, '第 1 段: ');

const firstParagraphResult = streamText({
  model: openai.chat('gpt-5.5'),
  messages: [
    ...modelMessages,
    {
      role: 'user',
      content:
        '根据上面的对话历史,写出故事的第一段。写得短一点。',
    },
  ],
});

writer.merge(firstParagraphResult.toUIMessageStream());
```

## 奇怪的错误

我们遇到的问题非常奇怪。在我们的 UI 顶部，最终出现了两条独立的消息：一条只有第一段，但第二条也有第一段。查看上面的视频可以看到直观效果。

## Start 和 Finish 部件的问题

问题在于有多个 start 和 finish 块被流式传输进来：

1. 第一段的 start 和 finish
2. 第二段的 start 和 finish
3. 第三段的 start 部件和 finish 部件

我原以为有多个 finish 和 start 部件没什么问题。但我和 AI SDK 的首席维护者 Lars 聊了聊，他说："哦不，我们不支持那样。"

你必须非常非常小心你的 start 和 finish 部件，否则你会遇到非常奇怪的错误，比如前端出现重复消息。

## 正确的做法

这段代码的正确工作方式是我们只应该有：

- 在流的最开始有一个 `start` 部件
- 在最后有一个 `finish` 部件

我们可以通过取消代码中被注释的 TODO、手动写入 start 部件来修复这个问题：

```ts
// TODO:试着取消注释,看看会发生什么
// writer.write({
//   type: 'start',
// });
```

顺便说一下，仅仅这个修改就足以修复我们遇到的奇怪错误。问题是那段文本在流开始之前就被流式传输了，所以它被计为了一条单独的消息。

而如果我们现在再试一次，就只会得到一条消息，因为流已经开始了。

## 进一步改进

我们还可以更进一步清理：进入 `toUIMessageStream` 函数，告诉它是否要发送 start 部件或 finish 部件。

对于第一段，我们不需要它发送 start 部件，因为我们已经开始了；也不需要发送 finish 部件，因为后面还有很多内容。

```ts
writer.merge(
  firstParagraphResult.toUIMessageStream({
    // TODO:试着取消注释,看看会发生什么
    // sendStart: false,
    // sendFinish: false,
  }),
);
```

第二段也一样。我们可以取消这两个参数的注释：

```ts
writer.merge(
  secondParagraphResult.toUIMessageStream({
    // TODO:试着取消注释,看看会发生什么
    // sendStart: false,
    // sendFinish: false,
  }),
);
```

然后在下面的第三段，我们只需要 `sendStart: false`，因为我们确实想让它添加 finish 部件：

```ts
writer.merge(
  thirdParagraphResult.toUIMessageStream({
    // TODO:试着取消注释,看看会发生什么
    // sendStart: false,
  }),
);
```

现在运行这个，我们可以看到这里有一个 start 类型，并且直到最后才有 finish 类型。所以这种行为——尽管要手动做确实挺烦人——更贴近 AI SDK 实际期望的方式。

所以如果你遇到任何有多个不同消息被流式传输进来的 bug，很可能与你的 start 和 finish 部件有关。

干得漂亮，我们下一课见。

## 完成步骤

- [ ] 取消注释开头的 `writer.write({ type: 'start' })` 块，手动写入 start 部件

- [ ] 取消注释第一段的 `toUIMessageStream` 调用中的 `sendStart: false` 和 `sendFinish: false` 参数

- [ ] 取消注释第二段的 `toUIMessageStream` 调用中的 `sendStart: false` 和 `sendFinish: false` 参数

- [ ] 取消注释第三段的 `toUIMessageStream` 调用中的 `sendStart: false` 参数
  - 注意我们这里不设置 `sendFinish: false`，因为我们想让它添加 finish 部件

- [ ] 通过运行练习来测试你的修改，观察 UI 中是否只出现一条消息而不是多条
