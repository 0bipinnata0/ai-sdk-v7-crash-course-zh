到目前为止，我们主要把智能体作为一种设置来对待。智能体是指你把应用控制流的完全控制权交给 LLM 的模式。换句话说，你给 LLM 一堆工具，然后 LLM 自己去决定：好，我先调用这个工具，然后再调用另一个工具——这可能产生好坏参半的结果。

它对于开放式任务来说非常好用，但对于那些你知道某一步应该总是跟在另一步之后的任务来说，就没那么合适了。

## 生成器-评估器工作流

本练习的目标是向你展示用确定性工作流设置能做什么。我们将使用一个生成器-评估器（generator-evaluator）工作流，其中：

1. 让一个 LLM 为我们写一条 Slack 消息
2. 让另一个 LLM 来评估它
3. 产出最终稿并把它流式传输给用户

这应该能给我们比单次 LLM 调用生成消息更好的输出。

## 代码

下面是我们将要处理的代码结构：

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const writeSlackResult = TODO; // 写 Slack 消息

  const evaluateSlackResult = TODO; // 评估 Slack 消息

  const finalSlackAttempt = TODO; // 写最终版 Slack 消息

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: finalSlackAttempt.stream }),
  });
};
```

你要写的所有代码都在这个 POST 请求里。我们上面有一个初始的 `writeSlackResult`，然后是一个 `evaluateSlackResult`——我们会把第一步产生的消息传给第二步——最后我们有一个 `finalSlackAttempt`。

## 辅助函数和提示词

我们已为每个步骤提供了有用的系统提示词：

```ts
const WRITE_SLACK_MESSAGE_FIRST_DRAFT_SYSTEM = `你正在根据对话历史为用户写一条 Slack 消息。只返回 Slack 消息,不要其他文本。`;

const EVALUATE_SLACK_MESSAGE_SYSTEM = `你正在评估用户产出的 Slack 消息。

  评估标准:
  - Slack 消息应该写得易于理解。
  - 它应该适合专业的 Slack 对话场景。
`;

const WRITE_SLACK_MESSAGE_FINAL_SYSTEM = `你正在根据对话历史、初稿以及针对该初稿的反馈来写一条 Slack 消息。

  只返回最终的 Slack 消息,不要其他文本。
`;
```

我们还有一个格式化消息历史的辅助函数：

```ts
const formatMessageHistory = (messages: UIMessage[]) => {
  return messages
    .map((message) => {
      return `${message.role}: ${message.parts
        .map((part) => {
          if (part.type === 'text') {
            return part.text;
          }

          return '';
        })
        .join('')}`;
    })
    .join('\n');
};
```

最终稿将被直接流式传输到前端，所以用户只会看到目前最好的版本。

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 实现第一个 `writeSlackResult` 函数，使用 GPT 模型和提供的系统提示词生成 Slack 消息初稿。你需要在这里使用 [`generateText`](/exercises/01-ai-sdk-basics/01.05-generating-text/problem/readme.md)。

- [ ] 实现 `evaluateSlackResult` 函数，用评估系统提示词进行另一次 LLM 调用来评估初稿——同样使用 [`generateText`](/exercises/01-ai-sdk-basics/01.05-generating-text/problem/readme.md)。

- [ ] 实现 `finalSlackAttempt` 函数，基于对话、初稿和反馈流式输出最终 Slack 消息。你需要在这里使用 [`streamText`](/exercises/01-ai-sdk-basics/01.06-stream-text-to-terminal/problem/readme.md)，然后用 [`toUIMessageStream` + `createUIMessageStreamResponse`](/exercises/01-ai-sdk-basics/01.08-stream-text-to-ui/problem/readme.md) 传递最终响应。

- [ ] 通过运行本地开发服务器并在 UI 中提交预填的提示词来测试你的实现。虽然你看不到初稿或评估过程，但你应该能看到最终结果。

- [ ] 观察三步流程是否比单次 LLM 调用产出了更好的结果，检查 UI 中最终流式传输的响应。
