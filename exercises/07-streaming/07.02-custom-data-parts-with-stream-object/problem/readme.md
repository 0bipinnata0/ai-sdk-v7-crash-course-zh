我们的单条建议设置运行得相当不错，但只有一条建议实在太简陋了。理想情况下，我们想提供多条建议，给用户更多选择。

要实现这一点，我们需要对当前实现做几处修改。让我们看看需要更新什么。

## `data-suggestion` -> `data-suggestions`

首先，我们需要修改 `MyMessage` 类型定义，支持多条建议而不是只有一条。这意味着把数据类型从单个字符串改为字符串数组。

看看 `problem/api/chat.ts` 中的代码，可以看到当前的类型定义：

```ts
export type MyMessage = UIMessage<
  never,
  {
    // TODO:把类型改为 'suggestions',
    // 并让它成为字符串数组
    suggestion: string;
  }
>;
```

## `streamText` -> `streamObject`

接下来，我们需要更新生成建议的方式。目前我们使用 `streamText`，它不太适合返回数组这样的结构化数据。更可靠的方式是改用 `streamObject` 的结构化输出。

我们还需要用 Zod 定义一个 schema，确保得到正确的数据结构：

```ts
// TODO:把 streamText 调用改为 streamObject,
// 因为我们需要使用结构化输出来可靠地
// 生成多条建议
const followupSuggestionsResult = streamText({
  model: google('gemini-2.5-flash'),
  // TODO:使用 zod 定义建议的 schema
  schema: TODO,
  messages: [
    ...modelMessages,
    {
      role: 'assistant',
      content: await streamTextResult.text,
    },
    {
      role: 'user',
      content:
        // TODO:修改提示词,告诉 LLM
        // 返回一个建议数组
        '我接下来应该问什么问题?只返回问题文本。',
    },
  ],
});
```

## 流式传输建议

在处理响应时，我们需要更新流式传输逻辑。不再跟随 `textStream`，而是遍历 `partialObjectStream`。这让我们能在流式传输过程中访问部分对象，包括建议数组：

```ts
// TODO:改为遍历 partialObjectStream
for await (const chunk of followupSuggestionsResult.textStream) {
  fullSuggestion += chunk;

  // TODO:改为用建议数组写入数据部件。
  // 你可能需要过滤掉 undefined 的建议。
  writer.write({
    id: dataPartId,
    type: 'data-suggestion',
    data: fullSuggestion,
  });
}
```

回到 [streamObject 练习](/exercises/01-ai-sdk-basics/01.12-streaming-objects-via-output/problem/readme.md)复习一下。

## 在前端显示建议

最后，我们需要更新前端代码来显示多条建议。`ChatInput` 组件已经更新为可以处理建议数组，但我们还需要修改 `root.tsx` 文件中的 `latestSuggestion` 变量：

```tsx
// TODO:更新这里以处理新的
// data-suggestions 部件
const latestSuggestion = messages[
  messages.length - 1
]?.parts.find((part) => part.type === 'data-suggestion')?.data;
```

这里需要改成能正确地从消息部件中提取建议数组。

目标是创建这样一个用户界面：用户提出问题后，会看到多个后续建议选项，让聊天体验更动态、更有帮助。

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 更新 `problem/api/chat.ts` 中的 `MyMessage` 类型，支持字符串数组
  - 把 `suggestion: string` 改为 `suggestions: string[]`

- [ ] 把生成建议的 `streamText` 调用改为 `streamObject`
  - 导入所需的函数：从 'ai' 导入 `streamObject`
  - 把函数调用从 `streamText` 更新为 `streamObject`

- [ ] 用 Zod 定义建议的 schema
  - 导入 zod:`import { z } from 'zod'`
  - 创建一个定义字符串数组的 schema

- [ ] 更新提示词，告诉 LLM 返回建议数组
  - 修改提示词，明确要求多个后续问题

- [ ] 更新流式传输逻辑，使用 `partialObjectStream`
  - 把 `followupSuggestionsResult.textStream` 改为 `followupSuggestionsResult.partialObjectStream`
  - 移除不再需要的 `fullSuggestion` 变量
  - 回到 [streamObject 练习](/exercises/01-ai-sdk-basics/01.12-streaming-objects-via-output/problem/readme.md)复习一下。

- [ ] 更新 `writer.write` 调用，处理建议数组
  - 把 data 字段改为使用来自 partial object stream 的 chunk
  - 过滤掉任何 undefined 的建议

- [ ] 更新 [`client/root.tsx`](./client/root.tsx) 中的 `latestSuggestion` 变量
  - 重命名为 `latestSuggestions`，以反映复数性质
  - 更新该变量，正确提取建议数组

- [ ] 更新 [`client/root.tsx`](./client/root.tsx) 中的 `ChatInput` 组件用法
  - 从传 `suggestion` 改为传 `suggestions`
  - 处理没有消息的情况，提供一个默认数组

- [ ] 测试你的实现
  - 用 `pnpm run exercise` 运行练习
  - 在 localhost:3000 查看本地开发服务器
  - 问一个问题，验证是否出现了多条建议
