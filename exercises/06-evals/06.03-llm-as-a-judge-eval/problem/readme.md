有些情况下，确定性评估就是不够用。如果你想衡量一个 LLM 的答案有多"好"呢？那么，"好"作为指标意味着什么？

我们希望答案是：

- 幽默的？
- 准确的？
- 符合事实的？
- 引用得当的？

对于这类问题，你经常会想："要是我有个助手能帮我过一遍所有这些回答并给它们打分就好了。"

当你有这种想法时，也许就该用上 LLM 作为裁判（LLM-as-a-judge）的评估了。

事实证明，LLM 真的很擅长评估其他 LLM 的输出。你不需要依赖一个假想中的助手来评估一切，而是可以把这份工作交给 LLM 自己。

## 设置

我们在 [`question-answerer.eval.ts`](./evals/question-answerer.eval.ts) 文件中。我们在这里创建了一个接收 PDF 的任务。

我选的 PDF 是思维链提示（chain of thought prompting）论文。这是第一篇定义思维链提示概念的论文。

```ts
evalite('Chain Of Thought Paper', {
  data: () => [
    {
      input: '什么是思维链提示?',
    },
    {
      input:
        '论文作者为什么认为思维链提示能带来改进?',
    },
  ],
  task: async (input) => {
    const result = await generateText({
      model: openai.chat('gpt-5.5'),
      instructions: `
        你是一个乐于助人的助手,可以回答关于思维链提示论文的问题。

        回答问题时务必引用论文中的原文。
      `,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: input,
            },
            {
              type: 'file',
              data: chainOfThoughtPaper,
              mediaType: 'application/pdf',
            },
          ],
        },
      ],
    });

    return result.text;
  },
  // scorer 在下面...
```

## Scorer

我们将接收这些输入，并把它们传给一个 `generateText` 调用，其系统提示词指示 AI 在回答时始终引用论文原文。

我们的 `evalite` 配置底部有两个评估器：

```ts
  scorers: [
    {
      name: 'Includes Quotes',
      scorer: ({ input, output, expected }) => {
        const quotesFound = output.includes('"');

        return quotesFound ? 1 : 0;
      },
    },
    attributionToChainOfThoughtPaper,
  ],
});
```

1. 一个简单的评估器，检查输出是否包含引文——这是一个确定性评估
2. 另一个 scorer——`attributionToChainOfThoughtPaper`。我们大部分工作将在这里进行。

## 归因 Scorer

在 [`attribution-eval.ts`](./evals/attribution-eval.ts) 评估器内部，我们调用 `createScorer`，这是在单独文件中创建 scorer 的方式：

```ts
export const attributionToChainOfThoughtPaper = createScorer<
  string,
  string
>({
  name: 'Attribution',
  scorer: async ({ input, output, expected }) => {
    const result = await generateObject({
      model: openai.chat('gpt-5.5'),
      instructions: ATTRIBUTION_PROMPT,
      messages: TODO, // TODO:传入思维链论文、问题和给出的答案
      schema: TODO, // TODO:定义响应的 schema
    });

    // 注意:对 LLM 使用基于字符串的分数很重要,
    // 因为 LLM 出了名的对不同数字有偏好。

    // 所以,我们让 LLM 返回一个字符串分数,然后
    // 把它映射到一个数字。
    const scoreMap = {
      A: 1,
      B: 0.5,
      C: 0,
      D: 0,
    };

    return {
      score: scoreMap[result.object.score],
      metadata: result.object.feedback,
    };
  },
});
```

这个评估器接收输入（问题）和输出（答案），评估从论文中提取的引文是否准确代表了论文的意图、是否正确地标注了来源。

我们使用一个特定的归因提示词：

```ts
const ATTRIBUTION_PROMPT = `
你是一个乐于助人的助手,可以回答关于思维链提示论文的问题。

你的工作是判断答案是否正确地归因于论文。

用 A、B、C 或 D 的评分回复。

A:答案有论文内容作为支撑,并且准确地引用了来源。
B:答案在一定程度上得到论文内容支撑,或者来源标注有误或不准确。
C:答案曲解了论文的意图。
D:答案没有提供来自论文的来源。
`;
```

## 任务

在实现上，我们需要完成两个 TODO:

1. 把思维链论文、问题和答案传给 `messages` 对象
2. 定义响应的 schema

有一个有趣的说明：对 LLM 使用基于字符串的分数（A、B、C、D）而不是数字分数，因为 LLM 可能对某些数字有偏好。然后我们把这些字符串分数映射为数值。

对于 LLM 作为裁判的评估，你真的希望它们解释自己在做什么、为什么给出某个分数，这就是我们同时返回 score 和 metadata（反馈/推理）的原因：

```ts
return {
  score: scoreMap[result.object.score],
  metadata: result.object.feedback,
};
```

一切设置好之后，你可以添加更多数据点来测试系统能否被攻破，或者用它做实验。

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 在 [`attributionToChainOfThoughtPaper`](./evals/attribution-eval.ts) scorer 中，把思维链论文、问题和答案传给 `messages` 对象

- [ ] 使用 zod 定义 LLM 响应的 schema，应包含一个 feedback 字符串和一个 score 枚举（'A'、'B'、'C'、'D')

- [ ] 可选：在 [`question-answerer.eval.ts`](./evals/question-answerer.eval.ts) 的 `data` 函数中添加更多测试用例，进一步测试系统

- [ ] 运行练习，看看你的实现是否正确评估了 LLM 关于思维链论文的回答

- [ ] 查看 LLM 裁判评估器返回的 metadata（点击测试用例，查看右侧面板）

- [ ] 通过检查 LLM 裁判评估器返回的 metadata（反馈）来调试任何问题
