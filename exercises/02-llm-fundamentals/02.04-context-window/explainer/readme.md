现在我们对 token 有了更深入的理解，让我们来谈谈当今 LLM 应用最大的约束之一：LLM 的上下文窗口（context window)。

每个 LLM 都有某种硬编码的上下文窗口——它在任何时刻能看到的 token 数量上限。上下文窗口包括输入 token 和输出 token——换句话说，就是 LLM 能看到的 token 总数。

在本练习中，我将向你展示当超出上下文窗口时会发生什么。

## 演示上下文窗口限制

在我们的练习中，我们将创建一个包含 1000 万个 token 的巨大输入文本。每一个都只是简单的 "foo"。

```typescript
const tokenizer = new Tiktoken(
  // 注意:o200k_base 是 GPT-4o 的分词器
  o200k_base,
);

const tokenize = (text: string) => {
  return tokenizer.encode(text);
};

let text = '';

const NUMBER_OF_TOKENS = 10_000_000;

for (let i = 0; i < NUMBER_OF_TOKENS; i++) {
  text += 'foo ';
}
```

我们会打印出这些 token 的数量，只是为了确认它们的长度。然后，我们用它们调用一个 LLM。

```typescript
const tokens = tokenize(text);

console.log(`Token 长度:${tokens.length}`);
```

## 关于 `maxRetries` 的说明

默认情况下，`generateText` 和 `streamText` 在调用失败时会重试 LLM 调用三次。这在生产环境中很有用，因为它能让应用对故障更有韧性。

不过，我们正预期它会失败，所以我们把它设置为零：

```typescript
await generateText({
  model: google('gemini-2.5-flash-lite'),
  prompt: text,
  maxRetries: 0,
});
```

当我用 Gemini 运行这个时，最终得到一个错误："You have exceeded your current quota."（你已超出当前配额。)

不同的模型提供商抛出不同的错误。比如，Anthropic 会直接校验并说请求太大。但这里要表达的概念是一样的：我们传给 LLM 的信息太多了。

## 理解上下文窗口的限制

所以，上下文窗口就是：LLM 在任一时刻能看到的输入和输出 token 的总数。

不同的模型有不同大小的上下文窗口，这让它们擅长不同的事情。有些模型相对简单，但有很大的上下文窗口。有些模型聪明得多，但能看到的相对较少。

我建议你用你最喜欢的模型之一试试这个练习。请注意，如果你搞错了——比如说，你加入了刚好低于最大数量的 token——那么你要为所有这些 token 付费。

祝你好运，我们下一课见。

## 完成步骤

- [ ] 查看代码，理解我们是如何创建一个非常大的文本来测试上下文窗口限制的

- [ ] 使用 `pnpm run dev` 运行代码，看看超出上下文窗口时会发生什么
  - 观察终端中出现的错误信息

- [ ] 通过修改 `generateText` 调用中的 `model` 参数，尝试使用不同的模型
  - 不同的模型有不同大小的上下文窗口

- [ ] 注意不同的模型提供商对上下文窗口溢出返回的不同类型的错误
