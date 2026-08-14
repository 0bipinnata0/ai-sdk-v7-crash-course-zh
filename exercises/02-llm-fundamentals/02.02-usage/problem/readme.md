AI SDK 提供了一个叫做"usage"（用量）的概念，可以用来监控你使用了多少 token。这能帮助你在使用 AI 模型时追踪和理解你的 token 消耗。

## 练习设置

在本练习中，我们将用一个模型生成一段关于香肠的回答，然后检查用量信息。

让我们看看要处理的代码：

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const output = streamText({
  model: openai.chat('gpt-5.5'),
  prompt: `哪个国家做的香肠最好?用一个段落回答。`,
});

for await (const chunk of output.textStream) {
  process.stdout.write(chunk);
}

console.log(); // 打印一个空行,把输出和用量信息隔开

// TODO:把用量信息打印到控制台
TODO;
```

## `await output.usage`

用量信息是 `output` 对象上的一个属性。不过要注意，你可能需要 await 这个属性，因为它可能是一个 promise。

打印出用量信息后，你会看到它上面有几个属性。这些属性提供了关于当前 AI 请求的 token 消耗详情。

花点时间检查这些属性，理解每一个代表什么。

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 从 output 对象访问 usage 属性
  - 它将包含关于 token 消耗的信息

- [ ] 如果 usage 是 promise，确保正确地 await 它
  - 记住，从 `streamText` 返回的许多属性都被包裹在 promise 中

- [ ] 将用量信息打印到控制台
  - 使用 `console.log()` 显示完整的 usage 对象

- [ ] 用 `pnpm run dev` 运行代码查看输出
  - 检查 usage 对象上的属性
  - 试着理解每个属性代表什么
