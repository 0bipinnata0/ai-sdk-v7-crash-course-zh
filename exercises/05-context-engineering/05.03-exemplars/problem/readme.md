在本练习中，我们将在提示词工程技能的基础上更进一步：给提示词添加示例（exemplars)。示例是输入-输出对，用来向模型展示我们想要什么样的响应。

现有的提示词已经有几个组成部分：任务上下文、规则、对话历史、提问和输出格式。现在我们需要添加示例，让它更加有效。

让我们看看需要修改的当前代码：

```typescript
const exemplars = [
  {
    input: `TypeScript 和 JavaScript 有什么区别?我应该先学 TypeScript 还是 JavaScript?`,
    expected: 'TypeScript 与 JavaScript 对比',
  },
  {
    input: `我想开始投资,但完全是新手。对于一个有 5000 元可投资的人来说,最安全的选择是什么?`,
    expected: '新手投资选择',
  },
];

const result = await streamText({
  model: google('gemini-2.5-flash-lite'),
  prompt: `
    <task-context>
    你是一个乐于助人的助手,可以为对话生成标题。
    </task-context>

    <rules>
    找到能抓住对话精髓的最简洁标题。
    标题最多 30 个字符。
    标题使用句子式大小写,每个单词首字母大写。结尾不要句号。
    </rules>

    ${TODO /* TODO:在这里添加示例,用 XML 格式化 */}

    <conversation-history>
    ${INPUT}
    </conversation-history>

    <the-ask>
    为这段对话生成一个标题。
    </the-ask>

    <output-format>
    只返回标题。
    </output-format>
  `,
});
```

任务是使用 XML 标签把示例插入提示词中。我们需要把 `TODO` 替换为格式正确的示例。

我们应该用 `<example>` 标签包裹每个示例，并在其中使用表示输入和预期输出的标签。

添加示例之后，我们甚至可以移除提示词中的其他部分，因为仅靠示例就能传达我们想要的大部分信息。你可能会发现不需要那么明确地指定规则或输出格式。

## 完成步骤

- [ ] 用 XML 格式的示例替换 TODO 注释
  - 使用 `<example>` 标签包裹每个示例
  - 在每个示例内部使用 `<input>` 和 `<expected>` 标签
  - 使用 `exemplars` 数组中的示例

- [ ] 通过运行练习来测试实现
  - 使用 `pnpm run exercise` 运行代码
  - 检查输出是否符合预期格式（为关于电磁灶的对话生成一个简洁的标题）

- [ ] 尝试移除提示词的其他部分
  - 添加示例后，试验移除其他部分
  - 看看在更少明确指令的情况下，模型是否仍然能产生好的结果
