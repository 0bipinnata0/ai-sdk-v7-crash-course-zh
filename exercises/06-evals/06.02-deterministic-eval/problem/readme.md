编写评估 scorer（评分器）主要有两种方式。我们先来看第一种：确定性 scorer（deterministic scorer)。这些是你用代码编写的 scorer，用来确定性地检查 LLM 输出中的某些内容。

它们的行为有点像单元测试——确定性的、快速的、容易编写。

另一种 scorer 是"LLM 作为裁判"(LLM as a judge）的 scorer。换句话说，就是概率性的 scorer，可能返回这样或那样的分数。它们适用于确定性 scorer 无法处理的其他类型的指标。我们稍后会讲——现在先关注你能用代码做什么。

## 数据

我在这里设置了一个问答函数。我们给了它一组链接：TypeScript 5.8 发布说明、5.5、5.6 等等。然后我们要问 LLM 几个问题。

```ts
const links = [
  {
    title: 'TypeScript 5.8',
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html',
  },
  // 更多链接...
];

evalite('Capitals', {
  data: () => [
    {
      input: '给我讲讲 TypeScript 5.8 版本',
    },
    {
      input: '给我讲讲 TypeScript 5.2 版本',
    },
  ],
  // ...
});
```

## Scorer

现在我们想从两个独立的指标来检查输出。我们想检查输出是否包含某种 markdown 链接：

```ts
{
    name: 'Includes Markdown Links',
    scorer: ({ input, output, expected }) => {
      // TODO:检查输出是否包含 markdown 链接
    },
  },
```

这是一个非常好的检查指标，因为它确保 LLM 在使用最新的、能支撑其论点的来源。

我们还希望输出极其简洁。所以我们想检查输出是否少于 500 个字符。

```ts
{
    name: 'Output length',
    scorer: ({ input, output, expected }) => {
      // TODO:检查输出是否少于 500 个字符
    },
  },
```

## 任务

你的任务是来做一点评估驱动开发（eval-driven development)。你将参照上一个练习中的例子来编写这里的 scorer。

然后，你要更新 [`evals/question-answerer.eval.ts`](./evals/question-answerer.eval.ts) 中的系统提示词，把链接传进去：

```ts
prompt: `
  你是一个乐于助人的助手,可以回答关于 TypeScript 版本发布的问题。

  问题:
  ${input}
`,
```

你还需要设计系统提示词，让它总是包含 markdown 链接，并且非常、非常简洁地回答问题。

然后你可以用 Evalite 来确保这两个确定性评估最终通过。

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 完成 "Includes Markdown Links" scorer
  - 实现用正则表达式检查输出是否包含 markdown 链接的逻辑（你的 LLM 可以帮你完成）
  - 找到链接返回 `1`，否则返回 `0`

- [ ] 完成 "Output length" scorer
  - 实现检查输出是否少于 500 个字符的逻辑
  - 足够简洁返回 `1`，否则返回 `0`

- [ ] 运行练习，查看评估结果

- [ ] 更新系统提示词：
  - 把链接数据传给模型
  - 明确指示模型包含 markdown 链接
  - 指导模型回答要极其简洁
  - 提供格式正确的 markdown 链接示例

- [ ] 使用 Evalite 运行评估，检查两个 scorer 是否都通过
  - 如果没通过，优化你的提示词直到通过为止
