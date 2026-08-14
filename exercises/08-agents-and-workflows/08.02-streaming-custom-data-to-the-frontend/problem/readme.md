我们的工作流运行得相当不错。我们得到了一些不错的输出，但用户在相当长的一段时间内屏幕上看不到任何东西。这是因为我们使用的是 `generateText` 而不是 `streamText`。

我们要把它改成使用 `streamText`，同时也借此机会练习一下自定义数据部件。

我们想要：

1. 把初稿流式传输到前端
2. 把评估单独流式传输
3. 在前端把它们区分开来显示

## 设置

我已经在 [./api/chat](./api/chat.ts) 中添加了一些必要的脚手架：

- 创建了一个带有 `MyMessage` 类型的 `createUIMessageStream`
- 设置了把那个流变成 `UIMessageStreamResponse` 的方式

## 声明自定义数据部件

你的第一项任务是声明自定义数据部件：

```typescript
export type MyMessage = UIMessage<
  unknown,
  {
    // TODO:在这里声明自定义数据部件
  }
>;
```

我建议一个部件用于评估，一个部件用于初稿。最终稿我们可以作为普通的文本部件流式传输。

你需要把这个文件夹中所有的 `UIMessage` 实例替换为 `MyMessage`。

## 从 `generateText` 切换到 `streamText`

接下来，我们需要去掉 execute 函数内部的 `generateText` 调用：

```typescript
// TODO - 改为 streamText,并作为自定义数据部件写入流
const writeSlackResult = await generateText({
  model: google('gemini-2.5-flash'),
  system: WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM,
  prompt: `
    对话历史:
    ${formatMessageHistory(messages)}
  `,
});

// TODO - 改为 streamText,并作为自定义数据部件写入流
const evaluateSlackResult = await generateText({
  model: google('gemini-2.5-flash'),
  system: EVALUATE_SLACK_MESSAGE_SYSTEM,
  prompt: `
    对话历史:
    ${formatMessageHistory(messages)}

    Slack 消息:
    ${writeSlackResult.text}
  `,
});
```

把这两个 `generateText` 调用都改成 `streamText`。观察文本流，并在流式传输的同时把它作为数据部件流式传输到前端。

确保你使用了 ID 技巧，这样你就能随时间更新同一个数据部件。我有一些[参考资料](/exercises/99-reference/99.06-custom-data-parts-id-reconciliation/explainer/readme.md)更详细地解释了这一点。

## 处理流式文本调用

最终版 Slack 消息已经在流式传输了，这很好：

```typescript
const finalSlackAttempt = streamText({
  model: google('gemini-2.5-flash'),
  system: WRITE_SLACK_MESSAGE_FINAL_SYSTEM,
  prompt: `
    对话历史:
    ${formatMessageHistory(messages)}

    初稿:
    ${writeSlackResult.text}

    之前的反馈:
    ${evaluateSlackResult.text}
  `,
});

// TODO:把最终版 Slack 消息合并到流中,
// 传入 sendStart: false
writer.TODO;
```

我们需要把它合并到 writer 中。合并时，我们需要传入 `sendStart: false`。

默认情况下，当你把一个 `UIMessageStream` 合并到另一个 `UIMessageStream` 时，它会发送 start 和 finish 部件。但因为我们在上面已经开始了消息，我们不希望它再次发送 start 部件。

事实上，我们想手动开始它，按照 `execute` 函数顶部的 `TODO`:

```typescript
// TODO:通过 writer.write 写入一个 { type: 'start' } 消息
TODO;
```

我有一些[参考资料](/exercises/99-reference/99.09-start-and-finish-parts/explainer/readme.md)更详细地解释了这一点。

## 前端修改

后端完成后，我们需要去前端。

首先，把我们的 `MyMessage` 类型传给 `useChat` hook:

```typescript
// TODO:把 MyMessage 传给 useChat hook:useChat<MyMessage>({})
const { messages, sendMessage } = useChat({});
```

然后，我们需要调整消息组件：

```tsx
export const Message = ({
  role,
  parts,
}: {
  role: string;
  parts: UIMessage['parts'];
}) => (
  <div className="my-4">
    {parts.map((part) => {
      // TODO:使用这个组件来处理你在
      // api/chat.ts 文件中创建的自定义数据部件
      TODO;

      if (part.type === 'text') {
        return (
          <div className="mb-4">
            <p className="text-gray-400 text-xs">
              <ReactMarkdown>
                {(role === 'user' ? '用户: ' : 'AI: ') +
                  part.text}
              </ReactMarkdown>
            </p>
          </div>
        );
      }

      return null;
    })}
  </div>
);
```

我们需要渲染一些 UI，把自定义部件渲染到前端。

## 测试

完成所有这些修改后，你应该能看到工作流的每个部分都流式传输到前端。这将：

1. 大幅改善我们的首 token 时间（time to first token)
2. 让用户完全了解工作流的每一个部分

## 完成步骤

- [ ] 在 api/chat.ts 的 `MyMessage` 类型中声明自定义数据部件
  - 一个用于评估
  - 一个用于初稿
  - 最终稿可以使用普通的文本部件

- [ ] 把代码中所有的 `UIMessage` 实例替换为 `MyMessage`

- [ ] 更新 api/chat.ts 中的 execute 函数
  - 添加通过 writer.write 写入 `{ type: 'start' }` 消息的代码。查看[参考资料](/exercises/99-reference/99.09-start-and-finish-parts/explainer/readme.md)理解我们为什么这样做。
  - 把两个 `generateText` 调用都改为 `streamText`，并作为自定义数据部件流式传输到前端。查看[参考资料](/exercises/99-reference/99.06-custom-data-parts-id-reconciliation/explainer/readme.md)了解如何做。

- [ ] 处理最终版 Slack 消息的流
  - 把 `finalSlackAttempt` 合并到 writer 中，传入 `sendStart: false`

- [ ] 更新前端组件
  - 在 client/root.tsx 中把 `MyMessage` 传给 `useChat` hook
  - 更新 client/components.tsx 中的 Message 组件来处理自定义数据部件

- [ ] 测试你的实现
  - 用 `pnpm run dev` 运行开发服务器
  - 在浏览器中查看 localhost:3000
  - 确认你能看到所有部分分别流式传输到前端
