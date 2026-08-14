用 AI 生成文本很强大，但等待整个输出完成会让应用感觉反应迟钝。现代 AI 应用会在文本生成的同时将其流式传输给用户，创造更动态的体验。

这个流式传输过程很复杂，但 AI SDK 为我们简化了它。在本练习中，我们将使用 Google 模型生成一个关于假想星球的故事，并将输出直接流式传输到终端。

让我们看看需要解决的问题：

```ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const model = openai.chat('gpt-5.5');

const prompt = '给我写一个关于假想星球的故事的第一段。';

const stream = TODO; // TODO - 用上面的模型流式输出一些文本。

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
```

我们需要将 `TODO` 替换为使用 AI SDK 中的 [`streamText`](./main.ts) 函数创建文本流的代码。

`streamText` 函数需要一个 `model` 和一个 `prompt`。我们的代码中已经定义好了这两个。

我们需要将这些值传给 [`streamText`](./main.ts) 来创建我们的 `stream` 对象，然后就能访问 `textStream` 属性。

`for await` 循环会遍历生成的每个文本块，`process.stdout.write()` 会将其显示在终端中而不添加换行（与 `console.log` 不同）。

这种方式让我们能看到文本随着 AI 生成逐步出现，创造出你在现代 AI 应用中看到的那种响应式流式效果。

## 完成步骤

- [ ] 将 `TODO` 替换为对 `streamText` 函数的调用。

- [ ] 确保将一个包含 `model` 和 `prompt` 变量的对象传给 `streamText`。

- [ ] 在终端中运行代码，观察文本实时流式输出。

- [ ] 观察文本是如何逐步出现而不是一次性全部出现的。

- [ ] 如果一切正常，你应该会看到一个关于假想星球的段落逐渐出现在终端中。

- [ ] 如果卡住了，查看解答。
