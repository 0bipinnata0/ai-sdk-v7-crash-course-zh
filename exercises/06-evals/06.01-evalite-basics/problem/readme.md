好了，现在我们知道了如何实现 AI 驱动的应用。我们真的需要知道如何测试它们。对于习惯了编写确定性代码的同学来说，你可能习惯了为你的应用编写单元测试。

而在 AI 世界里，对应的东西叫做 eval（评估）。这些是你可以运行的程序，用来评估你的 AI 输出是否符合特定标准。

与单元测试给你通过/失败的结果不同，eval 会给你一个分数。它会给你一个 0 到 100 的评分，衡量你的 AI 应用在某些任务上表现有多好。

## Evalite

市面上有很多可以用来运行 eval 的工具，比如 [Braintrust](https://www.braintrust.dev/) 或 [Langfuse](https://langfuse.com/)。我们要用的是 [Evalite](https://evalite.dev)，它可以完全在本地运行，除了 AI 费用之外不花你一分钱。

我们打开 [`example.eval.ts`](./evals/example.eval.ts)，会看到 Evalite 在这里被调用，标题为 "Capitals"（首都）。这是我们要运行的 eval 的名称。

```ts
import { evalite } from 'evalite';

evalite('Capitals', {
  // 配置写在这里
});
```

这里有一些数据，是你要让 LLM 执行的不同任务的列表，以及一些预期输出：

```ts
evalite('Capitals', {
  data: () => [
    {
      input: '法国的首都是哪里?',
      expected: '巴黎',
    },
    {
      input: '德国的首都是哪里?',
      expected: '柏林',
    },
    {
      input: '意大利的首都是哪里?',
      expected: '罗马',
    },
  ],
  // ...其他属性
});
```

你需要实现 task 函数，它执行实际的 AI 调用：

```ts
evalite('Capitals', {
  // ...其他属性
  task: async (input) => {
    const capitalResult = TODO; // 实现这个!

    return capitalResult.text;
  },
});
```

scorer（评分器）将评估 LLM 是否干得不错：

```ts
evalite('Capitals', {
  // ...其他属性
  scorers: [
    {
      name: 'includes',
      scorer: ({ input, output, expected }) => {
        return output.includes(expected!) ? 1 : 0;
      },
    },
  ],
});
```

在这个例子中，我们会检查 LLM 的输出，看它是否包含我们期望出现在字符串中的内容。比如，我们期望它在回答"意大利的首都是哪里？"时会给出与罗马有关的答案。

如果包含，就得 1 分，表示 100%；如果不包含，就得 0 分，表示 0%。

## 你的任务

你需要做的就是实现 task 函数，这将是一个相当简单的 AI SDK 调用，让 LLM 返回某个首都结果。

运行练习后，你会看到 Evalite 的输出，并且可以在 [localhost:3006](http://localhost:3006) 打开一个本地开发服务器来查看输出。

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 在文件顶部导入必要的 AI SDK 组件

  ```ts
  import { google } from '@ai-sdk/google';
  import { generateText } from 'ai';
  ```

- [ ] 实现 `task` 函数，使用 AI SDK 生成关于首都的回答

  ```ts
  task: async (input) => {
    const capitalResult = // 用适当的 model 和 prompt 调用 generateText

    return capitalResult.text;
  },
  ```

- [ ] 你的提示词应该指示模型回答关于国家首都的问题

- [ ] 运行练习，查看评估结果

- [ ] 检查你的实现在测试用例（法国/巴黎、德国/柏林、意大利/罗马）上是否得分良好

- [ ] 阅读 [Evalite 文档](https://evalite.dev)，概览 Evalite 的功能
