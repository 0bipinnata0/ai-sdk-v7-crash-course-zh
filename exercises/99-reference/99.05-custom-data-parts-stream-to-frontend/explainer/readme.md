现在我们要看看如何把这些自定义数据部件流式传输到前端。让我们通过代码来了解它是如何工作的。

首先，我们定义自定义消息类型：

```ts
export type MyMessage = UIMessage<
  unknown,
  {
    hello: string;
    goodbye: string;
  }
>;
```

这创建了一个能处理我们自定义数据部件的 `UIMessage` 类型。我们的 [API 路由](./api/chat.ts)仍然创建一个与之前类似的消息流：

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    writer.write({
      type: 'data-hello',
      data: 'Bonjour!',
    });
    // 更多写入...
  },
});
```

在前端的[客户端组件](./client/components.tsx)中，我们用自定义消息类型来使用 `useChat` hook:

```tsx
const { messages, sendMessage } = useChat<MyMessage>({});
```

消息被传入我们的 `Message` 组件，它接受类型为 `MyMessage['parts']` 的 parts:

```tsx
export const Message = ({
  role,
  parts,
}: {
  role: string;
  parts: MyMessage['parts'];
}) => {
  // 组件实现
};
```

在这个组件内部，我们处理自定义数据部件：

```tsx
{
  parts.map((part) => {
    if (part.type === 'data-hello') {
      return (
        <div
          key={part.id}
          className="flex items-center space-x-3"
        >
          <MessageCircle />
          <span>{part.data}</span>
        </div>
      );
    }
    if (part.type === 'data-goodbye') {
      return (
        <div
          key={part.id}
          className="flex items-center space-x-3"
        >
          <MessageCircleOff />
          <span>{part.data}</span>
        </div>
      );
    }
    return null;
  });
}
```

当我们在前端测试这个时，会在浏览器中看到这个输出：

```
{ type: 'data-hello', data: 'Bonjour!' }
{ type: 'data-goodbye', data: 'Au revoir!' }
{ type: 'data-hello', data: 'Guten Tag!' }
{ type: 'data-goodbye', data: 'Auf Wiedersehen!' }
```

然后由我们的 `Message` 组件渲染并显示在前端。

查看上面的视频，看看实际运行效果。

干得漂亮。我们下一课见。
