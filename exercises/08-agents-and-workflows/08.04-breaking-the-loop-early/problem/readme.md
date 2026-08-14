好，现在我们已经搭好了循环，是时候亮出我的王牌了。拥有智能体行为的意义就在于把控制流的控制权交给 LLM。我们目前的设置_太_确定了。

## 问题

我们的[当前流程](./api/chat.ts)_总是_走完整个循环。我们要给 LLM 提前跳出循环的能力。这是当前的循环：

```ts
while (step < 2) {
  // 写 Slack 消息
  const writeSlackResult = streamText({
    model: openai.chat('gpt-5.5'),
    instructions: WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM,
    prompt: `/* 提示词内容 */`,
  });

  // 把消息流式传输给用户
  const draftId = crypto.randomUUID();
  let draft = '';
  for await (const part of writeSlackResult.textStream) {
    draft += part;
    writer.write({
      type: 'data-slack-message',
      data: draft,
      id: draftId,
    });
  }
  mostRecentDraft = draft;

  // 评估消息
  const evaluateSlackResult = streamText({
    /* 评估设置 */
  });
  // 处理反馈...

  step++;
}
```

无论发生什么，我们总是回到循环顶部。这里没有办法跳出循环。我们要让 LLM 自己来选择是否应该提前跳出。

换句话说，它不只需要返回推理和反馈，还需要返回一个"这是否足够好"的布尔值。我们无法从区区一个 `streamText` 调用中提取出这个信息：

相反，我们应该使用 [`streamObject`](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data#stream-object)。`streamObject` 将给我们带来两全其美的效果：

1. 它允许我们在反馈出现在对象流中时把它流式传输给用户，所以在反馈生成过程中用户仍然能看到东西
2. 它还能锁定评估的输出结构，这样我们能在一个字段中得到反馈，在另一个字段中得到我们程序真正需要的布尔值。

## 步骤

我们需要：

- 把 [`streamText`](./api/chat.ts) 调用替换为 `streamObject` 调用
- 为输出定义一个 schema
- 如果 `streamObject` 调用说我们应该跳出循环，我们就跳出
- 在反馈出现时把它流式传输到前端

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 把评估部分的 `streamText` 调用替换为 [`streamObject`](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data#stream-object) 调用

- [ ] 从 'ai' 包导入 `streamObject` 函数

- [ ] 导入 [`zod`](https://zod.dev/) 包用于定义 schema

- [ ] 为输出定义一个 schema，包含：
  - 一个反馈字符串
  - 一个表示草稿是否足够好的布尔值

- [ ] 更新代码，在反馈出现在 `partialObjectStream` 中时把它流式传输到前端。回到 [streamObject 练习](/exercises/01-ai-sdk-basics/01.12-streaming-objects-via-output/problem/readme.md)复习一下。

- [ ] 修改循环，当 LLM 表示草稿足够好时提前跳出

- [ ] 通过运行本地开发服务器来测试你的实现，观察循环是否在适当的时候提前跳出
