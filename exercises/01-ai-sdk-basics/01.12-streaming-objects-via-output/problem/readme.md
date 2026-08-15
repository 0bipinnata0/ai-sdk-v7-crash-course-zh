生成对象很有用，但我们可以做得更好。在使用 LLM 时，我们应该始终考虑流式传输——因为 LLM 是一个 token 一个 token 地生成的，等待整个响应完成会让用户感觉缓慢。

我们可以不必等待完整的对象生成完毕，而是在部分结果到达时就将其流式输出。这能给用户即时的反馈和更令人满意的体验。

好消息是？做出这个改变只需要对现有代码做极少的修改。

## 完成步骤

- [ ] 在你的事实生成代码中，将 `generateText` 替换为 [`streamText`](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text)

保持相同的 [`Output.object()`](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) 配置和你的 facts schema。

```ts
// 从 generateText 改为 streamText
const factsResult = streamText({
  model,
  prompt: `给我一些关于这个假想星球的事实。这是故事:${finalText}`,
  output: Output.object({
    schema: z.object({
      facts: z
        .array(z.string())
        .describe(
          '关于这个假想星球的事实。以科学家的口吻来写。',
        ),
    }),
  }),
});
```

- [ ] 用遍历 [`partialOutputStream`](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) 的 [`for await...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) 循环替换 console.log

不要只打印一次最终输出，而是在流式块到达时遍历它们。

```ts
// TODO:将其替换为对 factsResult.partialOutputStream 的 for-await 循环
// 打印每个到达的部分对象
console.log(factsResult.output);
```

每次迭代都会打印一个到目前为止构建出来的部分对象。你可能一开始会看到一个空的 facts 数组，然后出现几个事实，然后更多事实——全部逐步到达。

<Spoiler>

```ts
for await (const chunk of factsResult.partialOutputStream) {
  console.log(chunk);
}
```

</Spoiler>

- [ ] 运行文件并观察流式行为

用 `pnpm run dev` 执行你的代码，观察 facts 数组是如何随时间逐步构建的，而不是在最后一次性全部出现。
