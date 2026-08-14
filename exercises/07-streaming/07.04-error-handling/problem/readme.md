流式传输中一个极其重要的部分是错误处理。在 AI SDK 中可能出错的地方非常非常多——而它处理错误的方式真的很优雅。

因为我们在向前端流式传输，如果流中发生了错误，它会直接把这个错误流式传输到前端。不过，你可能想显示比 AI SDK 默认提供的更友好的错误信息。

## 设置

我在这里准备了一些演示代码，它创建一个 UI 消息流，并立即抛出一个重试错误。这模拟了 `streamText` 出错时会发生的情况。

```typescript
import { createUIMessageStream, RetryError } from 'ai';

const stream = createUIMessageStream({
  execute: async ({ writer }) => {
    throw new RetryError({
      errors: [new Error('An error occurred')],
      message: 'Maximum retries exceeded',
      reason: 'maxRetriesExceeded',
    });
  },
  // ...
});
```

## `onError` 处理器

这个 `execute` 函数中发生的任何错误都会冒泡到 `onError` 处理器。在这里我们遇到了第一个 TODO：使用 `RetryError.isInstance` 检查错误是否是 `RetryError`，如果是，我们将返回一条告诉用户重试的消息。

```typescript
onError(error) {
  // TODO:使用以下方式检查错误是否是 RetryError:
  // RetryError.isInstance(error)
  if (TODO) {
    // TODO:如果是,返回一条告诉用户重试的消息
    return TODO;
  }

  // TODO:如果错误不是 RetryError,返回一条默认消息
  return TODO;
}
```

如果我们无法用 `RetryError.isInstance` 识别错误，那么当错误不是重试错误时，我们就返回一条默认消息。比如"发生了未知错误"。

## 前端

一切接好之后，现在该真正在前端显示它了。这是 [`App` 组件](./client/root.tsx):

```tsx
const App = () => {
  // TODO:从 useChat hook 解构出 error 属性
  const { messages, sendMessage } = useChat({});

  const [input, setInput] = useState(
    `法国的首都是哪里?`,
  );

  return (
    <Wrapper>
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          parts={message.parts}
        />
      ))}
      {/* TODO:如果存在错误,显示错误消息 */}
      {TODO}
      <ChatInput
        input={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({
            text: input,
          });
          setInput('');
        }}
      />
    </Wrapper>
  );
};
```

我们的第一项工作是进入 `useChat`，解构出这里的 `error` 属性。这个 error 将是一个带有 message 的错误对象。

下面有一个叫做 `ErrorMessage` 的组件，它会用一个漂亮的小图标来显示消息：

```tsx
const ErrorMessage = ({ error }: { error: Error }) => {
  return (
    <div className="flex items-center gap-2 p-3 mb-4 text-red-300 bg-red-900/20 border border-red-500/30 rounded-lg">
      <AlertCircle className="size-5 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  );
};
```

所以你的任务是在错误存在时显示错误消息。我觉得放在消息下面是个不错的位置。

完成之后，你应该能运行代码，向后端发送任何消息，然后它会立即显示一条错误消息。祝你好运，我们解答部分见。

## 完成步骤

- [ ] 完成 API chat.ts 文件中的 `onError` 处理器：
  - 把第一个 TODO 替换为 `RetryError.isInstance(error)`
  - 对于第二个 TODO，返回一条用户友好的消息，比如 `"请稍后重试。"`
  - 对于第三个 TODO，返回一条通用消息，比如 `"发生了未知错误。"`

- [ ] 更新 App 组件来处理错误：
  - 从 `useChat()` hook 中解构出 `error` 属性
  - 把 JSX 中的 TODO 替换为 ErrorMessage 组件的条件渲染，比如 `{error && <ErrorMessage error={error} />}`

- [ ] 测试你的实现：
  - 用 `pnpm run exercise` 运行练习
  - 在浏览器中打开 localhost:3000
  - 向后端发送任何消息
  - 验证你看到了自定义的错误消息
