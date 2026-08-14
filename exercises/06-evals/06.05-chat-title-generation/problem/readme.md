现在我们了解了 eval 的基础知识，以及如何使用 LLM 作为裁判的 scorer 和确定性 scorer。我想让你处在一个能做评估驱动开发（eval-driven development）的场景中。我们要重做一个之前做过的练习：从聊天历史生成标题。

## 评估

我们这里有一个叫做聊天标题生成的 eval，它只是调用 `generateText`，传入 `google('gemini-2.5-flash-lite')`，并说"根据输入给我生成一个标题":

```typescript
const result = await generateText({
  model: google('gemini-2.5-flash-lite'),
  prompt: `
    给我生成一个标题:
    ${input}
  `,
});
```

你的任务——一个相当自由发挥的任务——是利用我为你准备的数据集来改进这个提示词。

## 数据集

我们有一个 `titles-dataset.csv`，它有两列：输入和期望输出。以下是数据集中的一些例子：

| 输入                                          | 输出               |
| --------------------------------------------- | ------------------ |
| 谷歌刚刚发布了他们最新的智能手表吗？          | 谷歌手表发布日期   |
| 如何在 Next.js 中设置身份验证？               | Next.js 身份验证设置 |
| React Query 最近有哪些变化？                  | React Query 近期变化 |
| 有没有办法优化我的 Tailwind CSS 打包体积？    | Tailwind CSS 优化  |
| 下一次苹果 iPhone 发布会是什么时候？          | 苹果 iPhone 发布会日程 |

我手动写了前 5-10 条，然后让 LLM 生成了其余的。

在 eval 中，我读取 CSV 文件并把它解析成包含输入和输出的数组。然后我只取数据集的前五条，并把它映射成 Evalite 期望的格式：

```typescript
const EVAL_DATA_SIZE = 5;

const dataForEvalite = data.data
  .slice(0, EVAL_DATA_SIZE)
  .map((row) => ({
    input: row.Input,
    expected: row.Output,
  }));
```

## 计划

以下是我推荐你完成这个练习的方式：

1. 先在没有任何 scorer 的情况下运行这些 eval，了解一下基线情况。开始时可以把 `EVAL_DATA_SIZE` 设为 5。
2. 然后，迭代提示词，先把前五条跑通。你可以使用我们在[之前的练习](/exercises/05-context-engineering/05.01-the-template/explainer/readme.md)中讨论过的提示词模板。现在，提示词非常简单：

```typescript
const result = await generateText({
  model: google('gemini-2.5-flash-lite'),
  prompt: `
    给我生成一个标题:
    ${input}
  `,
});
```

3. 当前五条跑通后，把数据集扩大到比如 15 条。你的评估方式是手动进行：把你系统的输出与数据集中的期望输出进行对比。

比如，数据集中可能写着"React Query 近期变化"，而你的输出可能是"React Query 最新动态"。一开始，你可以只用肉眼对比黄金输出和你的输出，看看它们是否足够好。

4. 这个阶段结束后，一旦你对想要的输出有了感觉，考虑添加一个确定性 scorer。一个例子是检查输出是否超过某个长度。

在这个阶段，scorer 会更像一个助手——在你手动评估输出时给你额外的反馈。

5. 最后，你可以考虑使用 LLM 作为裁判的 scorer。为此，你可以把输入、期望输出和你系统的实际输出交给 LLM，让它判断输出与期望输出的质量是否相当。

它们不必完全相同，但如果质量相当，你就可以说，好，这算通过。

把这次当作你试验 eval 的机会，以一种非常自由的方式尝试评估驱动开发。祝你好运！

## 完成步骤

- [ ] 在没有任何 scorer 的情况下运行 eval，获得基线
  - 把 `EVAL_DATA_SIZE` 设为 5
  - 观察当前输出与期望输出的对比

- [ ] 改进提示词模板
  - 使用之前练习中的技巧
  - 修改提示词，生成更接近期望输出的标题

- [ ] 用前 5 条数据测试，直到获得好的结果
  - 用肉眼对比你的输出和期望输出

- [ ] 扩大数据集规模
  - 把 `EVAL_DATA_SIZE` 改为 15
  - 用更多例子测试你的提示词

- [ ] 添加一个确定性 scorer
  - 创建一个检查输出长度的 scorer
  - 把它添加到 eval 的 `scorers` 数组中

- [ ] 实现一个 LLM 作为裁判的 scorer
  - 创建一个比较你的输出与期望输出质量的 scorer
  - 把它添加到 eval 的 `scorers` 数组中
