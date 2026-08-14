在本练习中，我们将学习如何使用 AI SDK 中的工具，创建一个以完全类型安全和自动补全的方式显示工具交互的前端。关键挑战是正确地为我们的 UI 消息标注类型，让它们能理解我们工具定义的结构。

## 移动工具定义

我们的第一项任务是把工具定义从 [`api/chat.ts`](./api/chat.ts) 中的 [`streamText`](./api/chat.ts) 调用内部提取出来，移到模块作用域。这样我们既能在运行时使用这些工具，又能从它们推断类型。

工具目前定义在 [`streamText`](./api/chat.ts) 函数调用内部：

```ts
const result = streamText({
  model: openai.chat('gpt-5.5'),
  messages: await convertToModelMessages(messages),
  instructions: `...`,
  tools: {
    writeFile: tool({...}),
    readFile: tool({...}),
    // ...其他工具
  },
  // ...
});
```

我们需要把这些工具定义移到当前标记为 `TODO` 的模块作用域变量中：

```ts
// 把工具定义移到这里
const tools = TODO;
```

## 创建自定义 UI 消息类型

移动工具定义之后，我们需要创建一个了解我们工具的自定义 UI 消息类型。AI SDK 的 `UIMessage` 类型接受类型参数，我们需要传入关于工具的信息：

```ts
// 用正确的类型替换这个 TODO
export type MyUIMessage = TODO;
```

我们将使用 `ai` 中的 `InferUITools` 工具类型，从我们的工具定义中推断出正确的工具类型。

## 在前端组件中使用自定义类型

有了自定义的 `MyUIMessage` 类型之后，我们需要在前端组件中使用它：

1. 在 [`root.tsx`](./client/root.tsx) 中，我们需要把 `MyUIMessage` 作为类型参数传给 `useChat`
2. 在 [`components.tsx`](./client/components.tsx) 中，我们需要把 `parts` 属性的类型从 `UIMessage['parts']` 更新为 `MyUIMessage['parts']`

## 实现 `writeFile` 工具的展示

最后，我们需要为 `writeFile` 工具实现缺失的 JSX。

`writeFile` 工具的 JSX 应该显示：

- 一个图标/表情符号（📝)
- 一个标题（"Wrote to file"，即"写入了文件")
- 文件的路径
- 内容的长度

它的样式应该与其他工具展示类似。

## 测试实现

当一切正确实现后，我们应该能够：

1. 运行开发服务器
2. 向 LLM 提问（比如"告诉我今天有哪些待办事项")
3. 看到格式美观的工具调用展示，包括我们新实现的 `writeFile` 工具展示

祝你好运，我们解答部分见！

## 完成步骤

- [ ] 把工具定义从 `streamText` 函数内部移到模块作用域变量 `tools`

- [ ] 使用 `InferUITools<typeof tools>` 作为第三个类型参数来创建 `MyUIMessage` 类型。查看[这些文档](https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message#creating-your-own-uimessage-type)了解更多信息

- [ ] 更新 `root.tsx` 中的 `useChat` 调用，传入 `MyUIMessage` 作为类型参数

- [ ] 把 `Message` 组件中 `parts` 属性的类型从 `UIMessage['parts']` 更新为 `MyUIMessage['parts']`

- [ ] 参照其他工具展示的模式，在 `Message` 组件中实现 `writeFile` 工具的 JSX

- [ ] 运行开发服务器，测试工具调用是否在 UI 中正确显示
