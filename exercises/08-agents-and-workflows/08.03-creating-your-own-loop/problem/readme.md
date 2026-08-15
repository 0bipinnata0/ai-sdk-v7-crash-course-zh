既然我们已经完全实现了工作流，为什么不往回拉一点，往工作流里注入一些智能体行为呢？不再是走一条线性路径——创建初稿、评估、再创建一份新稿——而是让那个循环运行特定的次数，看看能否得到更好的输出。

这种方式的吸引力在于灵活性。循环次数可以随时间增加，或者远程配置来调整我们的系统。你甚至可以通过增加付费更高的客户的循环迭代次数，给他们比低付费客户更好的体验。

代码位于我们的 POST 路由中。在 problem 代码中，我们需要修改 [`execute`](./api/chat.ts) 函数来实现我们的循环：

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyMessage[] } = await req.json();
  const { messages } = body;

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      let step = TODO; // TODO:记录当前在第几步
      let mostRecentDraft = TODO; // TODO:记录最近的草稿
      let mostRecentFeedback = TODO; // TODO:记录最近的反馈

      // TODO:创建一个循环,它:
      // 1. 写一条 Slack 消息
      // 2. 评估这条 Slack 消息
      // 3. 把反馈保存到上面的变量中
      // 4. 递增 step 变量
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: stream.stream }),
  });
};
```

不再是现有的那种初稿、反馈、最终消息各自独立的线性工作流，我们将创建一个 `while` 循环，把这个过程重复指定的次数。

我们需要通过追踪以下状态来在迭代之间保持状态：

- 当前在第几步
- 最近的草稿
- 最近的反馈

循环结束后，我们将把最终草稿作为响应，以文本部件（而不是自定义数据部件）的形式流式传输。查看[参考资料](/exercises/99-reference/99.08-streaming-text-parts-by-hand/explainer/readme.md)了解如何做。

确保锁死你的 while 循环的停止条件——可能无限循环的付费系统是很吓人的！始终确保你的循环有明确的退出条件。

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 在 `execute` 函数开头初始化变量：`step`（从 0 开始）、`mostRecentDraft`（空字符串）和 `mostRecentFeedback`（空字符串）

- [ ] 创建一个 `while` 循环，在 `step < 2`（或你选择的其他数字）时继续

- [ ] 在每次循环迭代结束时递增 `step` 变量

- [ ] 在循环内部，实现 Slack 消息撰写逻辑：
  - 使用 `writer.write` 把草稿流式传输到客户端
  - 把草稿存入 `mostRecentDraft`

- [ ] 仍然在循环内部，实现评估逻辑：
  - 把反馈流式传输到客户端
  - 把反馈存入 `mostRecentFeedback`

- [ ] 循环完成后，把最终文本作为文本部件流式传输：
  - 创建一个 text-start 部件
  - 创建一个带有最终草稿的 text-delta 部件
  - 创建一个 text-end 部件

- [ ] 通过运行本地开发服务器来测试你的实现，检查 Slack 消息生成是否显示了多轮草稿和反馈循环
