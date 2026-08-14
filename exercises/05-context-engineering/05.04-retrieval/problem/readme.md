在本练习中，我们将探索如何在提示词模板中处理检索到的外部数据。检索外部数据并将其放入上下文，是减少 LLM 幻觉的一项强大技术。

我们有几个测试用例可以尝试：

- Guillermo Rauch 对 Matt Pocock 的评价是什么？
- Matt Pocock 的开源背景是什么？
- 为什么学习 TypeScript 很重要？

代码使用了 [Tavily](https://www.tavily.com/)，一个可以处理搜索相关任务的第三方服务。我们使用它的抓取能力，通过在 Tavily 客户端上调用 `extract` 并传入一个 URL，来获取网页的原始内容。

让我们看看主要代码：

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { tavily } from '@tavily/core';

const testCases = [
  {
    input: 'Guillermo Rauch 对 Matt Pocock 的评价是什么?',
    url: 'https://www.aihero.dev/',
  },
  {
    input: 'Matt Pocock 的开源背景是什么?',
    url: 'https://www.aihero.dev/',
  },
  {
    input: '为什么学习 TypeScript 很重要?',
    url: 'https://totaltypescript.com/',
  },
] as const;
```

代码设置了包含问题和对应抓取 URL 的测试用例。

```typescript
// 修改这个值来尝试不同的测试用例
const TEST_CASE_TO_TRY = 0;

const { input, url } = testCases[TEST_CASE_TO_TRY];
```

我们可以通过修改 `TEST_CASE_TO_TRY` 的值来选择要尝试的测试用例。

```typescript
const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

const scrapeResult = await tavilyClient.extract([url]);

const rawContent = scrapeResult.results[0]?.rawContent;

if (!rawContent) {
  throw new Error('无法抓取该 URL');
}
```

这段代码初始化 Tavily 客户端，抓取 URL，并从结果中提取原始内容。

现在，我们需要完成提示词模板中的三个 TODO:

```typescript
// TODO:添加背景数据和对话历史
// TODO:添加一些规则,告诉模型在输出中使用段落,并引用网站内容中的引文来回答问题。
// TODO:添加输出格式,告诉模型只返回摘要,不要任何其他文本。
const result = await streamText({
  model: openai.chat('gpt-5.5'),
  prompt: `
    <task-context>
    你是一个乐于助人的助手,负责总结 URL 的内容。
    </task-context>

    <the-ask>
    根据对话历史总结网站的内容。
    </the-ask>
  `,
});
```

这些 TODO 引导我们增强提示词模板：

1. 用 XML 标签格式化内容并添加对话历史
2. 为模型的输出格式添加规则（段落、引文）
3. 指定输出格式（仅摘要）

这些元素在提示词中的顺序对效果至关重要——背景数据、对话历史和输出格式应该按照特定的方式排列。

```typescript
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

最后，这段代码把模型的响应流式输出到控制台。

## 完成步骤

- [ ] 用 XML 标签格式化抓取的内容
  - 把原始内容放在适当的 XML 标签中，比如 `<content>` 或 `<background-data>`
  - 这为模型提供了工作的上下文

- [ ] 添加对话历史
  - 包含所选测试用例中的用户问题
  - 适当地格式化，可能使用 `<conversation-history>` 标签

- [ ] 为模型的输出添加规则
  - 指示模型在输出中使用段落
  - 告诉模型使用网站内容中的引文
  - 考虑把这些放在 `<rules>` 之类的部分下

- [ ] 指定输出格式
  - 添加指令让模型只返回摘要
  - 明确不应包含任何其他文本
  - 考虑使用 `<output-format>` 标签

- [ ] 测试你的实现
  - 使用 `pnpm run exercise` 运行练习
  - 通过修改 `TEST_CASE_TO_TRY` 的值尝试不同的测试用例
  - 验证输出是否遵循你的格式规则并准确回答了问题
