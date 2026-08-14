在本练习中，我们将探索给消息添加 metadata（元数据）。这是你想追踪的关于消息的附加信息，它不一定属于 parts 的范畴。比如，我们永远不会想给一条消息加多个 metadata 条目——它只是关于这条消息的一份信息。

在我们的例子中，我们想追踪每条消息生成花了多长时间，然后把它展示给用户。这是很有用的信息，特别是对于深度研究这样运行时间很长的工作流。

## 给消息类型添加 Metadata

计划是从 `api/chat.ts` 开始，再次定制 `UIMessage` 类型。`UIMessage` 类型有三个类型参数，第一个就是 metadata。我们将在这里传入我们的类型——一个带有 `duration` 属性的对象，表示完成消息流式传输所花的毫秒数。

```ts
// TODO:在这里的对象中添加 metadata 的类型
// 我们可能想要 { duration: number }
export type MyUIMessage = UIMessage<TODO>;
```

## 实现消息 Metadata 函数

完成之后，我们将在 `result.toUIMessageStreamResponse` 中实现 `messageMetadata` 函数。

```ts
// TODO:计算流的开始时间
const startTime = TODO;

return result.toUIMessageStreamResponse<MyUIMessage>({
  // TODO:在这里添加 messageMetadata 函数
  // 如果遇到 'finish' 部件,它应该返回
  // 流的持续时间(毫秒)
  messageMetadata: TODO,
});
```

`messageMetadata` 回调会在每一个文本部件上被调用，当我们遇到类型为 'finish' 的部件（AI SDK 在消息创建完成时发送）时，我们将计算持续时间，并把它作为消息 metadata 发送。

我们需要捕获流的开始时间，这样才能计算完成它花了多长时间。

查看[参考资料](/exercises/99-reference/99.07-message-metadata/explainer/readme.md)了解更多信息。

## 更新前端代码

在前端代码中，我们也需要做一些修改。我们需要更新 `metadata` 参数的类型：

```tsx
// problem/client/components.tsx
export const Message = ({
  role,
  parts,
  metadata,
}: {
  role: string;
  parts: MyUIMessage['parts'];
  // TODO:在这里为 metadata 添加类型
  metadata: TODO;
}) => {
```

最后，我们需要把实际的 metadata 传给 `Message` 组件。

```tsx
// problem/client/root.tsx
<Message
  key={message.id}
  role={message.role}
  parts={message.parts}
  // TODO:把 metadata 传给 Message 组件
  metadata={TODO}
/>
```

我已经搭好了实际的前端代码，所以你在那边不用做太多。只要 `metadata.duration` 是一个数字，提供的 `formatDuration` 函数就会处理好持续时间的漂亮展示。

## 完成步骤

- [ ] 更新 `api/chat.ts` 中的 `MyUIMessage` 类型，包含带有 duration 属性的 metadata
  - 添加 `{ duration: number }` 作为 metadata 类型参数

- [ ] 在 `api/chat.ts` 中初始化 `startTime` 变量
  - 使用 `Date.now()` 在流开始时捕获当前时间戳

- [ ] 在 `toUIMessageStreamResponse` 中实现 `messageMetadata` 函数
  - 遇到类型为 'finish' 的部件时返回持续时间
  - 持续时间的计算方式是当前时间减去开始时间

- [ ] 更新 `Message` 组件中的 `metadata` 类型
  - 使用与 `MyUIMessage` 中定义相同的类型

- [ ] 在 `root.tsx` 中把消息 metadata 传给 `Message` 组件
  - 只需把 `message.metadata` 传给组件

- [ ] 通过运行练习测试解决方案
  - 运行 `pnpm run exercise`
  - 打开 localhost:3000
  - 发送一条消息，观察 AI 回复后是否显示持续时间
