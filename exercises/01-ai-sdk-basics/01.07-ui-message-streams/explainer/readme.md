到目前为止，我们已经看到了如何从 LLM 的响应中流式传输文本，但 LLM 能返回的不只是文本部分。

它们可以返回推理 token，可以返回来源（sources)，可以返回工具调用和工具结果——还有更多。

流（stream）是连接你的前端和后端的东西。而所有这些不同类型的部件，无法只用单一的文本流来表示。我们需要更复杂一点的东西。

在 AI SDK 中，这就是 `UIMessageStream`。`UIMessage` 是 AI SDK 中一个非常重要的类型。它代表消息在 UI 中呈现的样子。所以 [`UIMessageStream`](./main.ts) 就是你的后端实时构建一个 `UIMessage` 的过程。

在这个例子中,我们把一个 Google 模型传给 [`streamText`](./main.ts),提示词是“给我写一首关于一只叫 Steven 的猫的十四行诗”。这里没有使用 `textStream`,而是调用 `toUIMessageStream` 并逐块流式输出。

```ts
const stream = streamText({
  model,
  prompt: '给我写一首关于一只叫 Steven 的猫的十四行诗。',
});

for await (const chunk of stream.toUIMessageStream()) {
  console.log(chunk);
}
```

如果我们运行这个练习，会看到一连串对象被流式输出，以 start 开始，然后是 start step，接着是 text start、text delta，以及各种各样的东西，一直到 finish 和 finish step。

输出看起来像这样：

```txt
{ type: 'start' }
{ type: 'start-step' }
{ type: 'text-start', id: '0' }
{ type: 'text-delta', id: '0', delta: '一' }
{ type: 'text-delta', id: '0', delta: '只叫 Steven 的猫,' }
// ... 更多 delta ...
{ type: 'text-end', id: '0' }
{ type: 'finish-step' }
{ type: 'finish' }
```

这些对象代表了 [`UIMessageStream`](./main.ts) 及其各种不同的部件。我们之前看到，流式传输到终端相对简单，但流式传输到 UI 意味着你需要更多的复杂性。而这正是 `UIMessageStream` 提供给你的。

在接下来的几个练习中我们会越来越多地看到它，特别是当我们查看网络标签页，观察从后端流式传输到前端的内容时。希望这个简短的介绍能让你对它的样子有个概念。

试着修改这里的提示词，看看能否得到一些不同的输出，用不同的输入多运行几次这个练习，看看输出是什么样子。熟悉 `UIMessageStream` 的结构。我们接下来会经常见到它。祝你好运，我们下一课见。

## 完成步骤

- [ ] 查看使用 `toUIMessageStream()` 而不是直接操作 `textStream` 的代码

- [ ] 运行练习，观察 `UIMessageStream` 输出中的不同对象类型

- [ ] 尝试修改 `streamText` 函数中的提示词，看看不同的输入如何影响输出格式

- [ ] 观察响应对象的结构及其各种类型：'start'、'start-step'、'text-start'、'text-delta' 等

- [ ] 熟悉这种格式，因为它将在未来的练习中被大量使用

- [ ] 试着理解这些结构化消息如何被用来构建更复杂的 UI
