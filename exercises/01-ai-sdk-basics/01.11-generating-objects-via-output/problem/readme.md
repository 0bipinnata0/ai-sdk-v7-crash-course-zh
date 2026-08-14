大多数时候，你想要的不仅仅是 LLM 返回的文本——你希望这些文本以结构化的格式呈现。想象一下，生成一个关于假想星球的故事，然后从中提取事实，作为一个干净的字符串数组。

[AI SDK](https://ai-sdk.dev/docs/introduction) 让这件事变得极其简单。你不需要先让模型返回文本然后自己解析（或用 [Zod](https://zod.dev) 这样的库验证），而是可以直接使用框架内置的结构化输出支持。

在 AI SDK 中实际上有两种方法可以做到这一点。一种方式更接近版本 5 的风格，另一种更接近版本 6——但两者在版本 6 中都能用。你的任务是实现结构化输出的生成。

## 完成步骤

- [ ] 使用 [`streamText()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) 将文本流式传输到终端

首先，将一个关于假想星球的故事段落流式传输到终端。

```ts
const stream = streamText({
  model,
  prompt: '给我写一个关于假想星球的故事的第一段。',
});

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}

const finalText = await stream.text;
```

- [ ] 调用带有结构化输出支持的 [`generateText()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text)

文本流式输出完成后，调用 `generateText()`，传入一个询问关于该星球的事实的提示词。传入上一步的 `finalText`。

```ts
// TODO:将其替换为对 generateText 的调用,传入:
// - model,与上面相同
// - prompt,询问关于假想星球的事实,
//   并将 finalText 作为故事传入
// - output,应该是 Output.object({}),传入
//   schema: z.object({
//     facts: z.array(z.string()).describe('关于这个假想星球的事实。以科学家的口吻来写。'),
//   })
const factsResult = TODO;
```

你需要从 AI SDK 中导入 [`Output`](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)，与 `generateText` 一起使用。

- [ ] 使用 [`Output.object()`](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) 方法定义结构化输出

传入一个带有 `schema` 属性的对象。schema 应该是一个 [Zod](https://zod.dev) 对象，其中 `facts` 字段包含一个字符串数组。

<Spoiler>

```ts
output: Output.object({
  schema: z.object({
    facts: z
      .array(z.string())
      .describe(
        '关于这个假想星球的事实。以科学家的口吻来写。',
      ),
  }),
});
```

</Spoiler>

记得在你的字段上使用 [`.describe()`](https://zod.dev/metadata) 来引导模型产出更好的输出。

- [ ] 打印结构化结果

从结果对象中访问输出并将其打印到终端。

```ts
console.log(factsResult.output);
```

- [ ] 运行你的方案

用 `pnpm run dev` 执行你的代码，并验证：

1. 星球故事流式输出到终端
2. 事实以带有字符串数组的结构化对象返回
3. 事实读起来像是科学家写的

- [ ] （可选）尝试替代方案

完成练习后，看看你是否能用 [`generateObject()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-object) 代替 `generateText()` 加 `Output.object()` 来实现版本 6 的方案。两种方法都可行，但其中一种是更新的模式。
