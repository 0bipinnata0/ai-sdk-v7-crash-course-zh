有时你想把一些关于消息的信息附加到消息本身上。在这种情况下，你可以使用 AI SDK 的消息 metadata（元数据）。

消息的 `parts` 是消息的实际内容，而消息的 `metadata` 是关于消息的信息。

## 追踪消息长度

在这个例子中，我们将记录一些关于生成消息长度的 metadata。做法是：声明一个 `MyMetadata` 类型，然后把它传给 `UIMessage` 来创建一个自定义消息类型：

```ts
type MyMetadata = {
  // 生成消息的长度
  length: number;
};

type MyMessage = UIMessage<MyMetadata>;
```

然后我们有一个标准的 `streamText` 调用：

```ts
const streamTextResult = streamText({
  model: openai.chat('gpt-5.5'),
  prompt: '你好,世界!',
});
```

在下面，我们把 `streamTextResult` 变成一个 `UIMessage` 流，把 `MyMessage` 作为类型参数传给 `UIMessageStream`:

```ts
let totalLength = 0;

const stream = streamTextResult.toUIMessageStream<MyMessage>({
  messageMetadata: ({ part }) => {
    if (part.type === 'text-delta') {
      totalLength += part.text.length;
    }

    if (part.type === 'finish') {
      return {
        length: totalLength,
      };
    }
  },
});
```

由于 `toUIMessageStream` 是一个函数，我们向它传入一个包含名为 `messageMetadata` 回调的对象。`messageMetadata` 会在 `UIMessage` 流的每个部件上被调用，你可以返回一些 metadata 来更新消息的 metadata。

多亏了 TypeScript 聪明的类型推断，这是类型安全的。所以如果我们在 `messageMetadata` 回调中把 `length` 拼错，就会得到一个错误。

我们这里的逻辑是：维护一个消息的总长度，每次看到一个 text-delta 部件时，测量那个文本部件的长度并加到总长度上。最后，当我们看到类型为 `finish` 的部件时，就返回我们的消息 metadata 类型。

## 测试输出

在下面，我们打印流的每个块，这样就能看到发生了什么：

```ts
for await (const chunk of stream) {
  console.log(chunk);
}
```

可以看到，我们以 start 和 start-step 块开始。然后 text delta 开始了，先是一个 "你好" 的 delta，然后是另一个 delta:

```txt
{ type: 'start' }
{ type: 'start-step' }
{ type: 'text-start', id: '0' }
{ type: 'text-delta', id: '0', delta: 'Hello' }
{
  type: 'text-delta',
  id: '0',
  delta: ' there! How can I help you today?\n'
}
{ type: 'text-end', id: '0' }
{ type: 'finish-step' }
{ type: 'finish', messageMetadata: { length: 39 } }
```

最后，来到 finish，这里附加了一些 `messageMetadata`，长度为 `39`。

你可以用消息 metadata 做各种各样的事情，比如追踪每条消息使用了哪个模型，当然，你也可以把它持久化到你的数据库中。

我建议你动手玩一玩，试着声明你自己的消息 metadata 类型，看看它如何影响从流中产出的块。

祝你好运，我们下一课见。

## 完成步骤

- [ ] 查看 [`MyMetadata` 类型定义](./main.ts)，以及它是如何被用来通过 `UIMessage` 创建自定义消息类型的
  - 这定义了我们将附加到消息上的 metadata 类型。

- [ ] 检查 `streamTextResult` 是如何通过 `toUIMessageStream` 转换为 `UIMessageStream` 的
  - 注意我们如何传入泛型类型参数 `<MyMessage>`。

- [ ] 研究 `messageMetadata` 回调的实现
  - 看看它如何追踪消息的总长度
  - 注意它如何在 `finish` 部件上返回 metadata 对象

- [ ] 运行示例代码，在控制台中查看输出
  - 观察 metadata 是如何附加到消息块上的

- [ ] 试着创建你自己的 metadata 类型和实现
  - 在你的 metadata 中试验不同的属性
  - 看看它们如何出现在输出流中
