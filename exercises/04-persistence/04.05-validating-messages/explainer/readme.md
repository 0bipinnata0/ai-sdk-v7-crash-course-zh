眼尖的同学可能已经注意到我们的代码有点不对劲。我们这里有一个 `POST` 请求，它从请求体中接收一些 JSON，然后直接从中取出 messages。

```typescript
const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();
  const { messages } = body;

  // ...
};
```

问题在于，我们没有检查 `body.messages` 是否是正确的结构。这可能导致下面的代码出现各种奇怪的错误。

对任何后端函数来说，校验它从前端收到的东西都是一个好习惯。

我们可以在这里创建一个巨大的 Zod schema，但 UI 消息有各种各样的部件：

- 不同的工具调用结构
- 各种状态
- 复杂的嵌套结构

要正确地校验它们，最终会是一项巨大的工作。

## 使用 `validateUIMessages`

幸运的是，AI SDK 导出了一个叫做 `validateUIMessages` 的函数。这个函数：

1. 接收来自请求体的消息
2. 返回一个 `UIMessage` 对象数组
3. 校验失败时抛出错误

下面是我们实现它的方式：

```typescript
let messages: UIMessage[];

try {
  messages = await validateUIMessages({
    messages: body.messages,
  });
} catch (error) {
  return new Response('Invalid messages', { status: 400 });
}
```

## 测试

你可以运行这个练习，并使用 [`command.md`](./command.md) 文件中提供的 curl 命令来测试。

这是一个不包含任何 parts 的无效消息示例：

```bash
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{
  "messages": [
    {
      "id": "invalid-message",
      "role": "user"
    }
  ]
}'
```

测试这个请求时,我们会收到一个“无效的消息”响应,状态码为 400。

而用一条有效的消息：

```bash
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{
  "messages": [
    {
      "id": "valid-message",
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "法国的首都是哪里?"
        }
      ]
    }
  ]
}'
```

运行这个请求会正确执行我们的应用，我们会收到返回的数据流。

## 总结

如果你在 API 路由中接收 `UIMessage` 数组，`validateUIMessages` 函数极其有用。它甚至通过传给函数的 schema 支持 AI SDK 更高级的部件。

干得漂亮，我们下一课见。

## 完成步骤

- [ ] 用有效和无效的消息格式测试你的实现
  - 使用 `command.md` 中提供的 curl 命令
  - 验证无效消息返回 400 状态码
  - 验证有效消息被正确处理
