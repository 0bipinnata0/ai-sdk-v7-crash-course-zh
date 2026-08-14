在任何 AI 驱动的应用中，我们都需要使用一个极其常见的模式：拒绝某些问题或拒绝用户某些请求的能力。这些被称为护栏（guardrails)。

## 为什么护栏很重要

每当你部署一个 AI 驱动的应用，你就是在把一个可能让你的公司难堪的东西放到外面。

我们在 AI 早期就见过这种情况：LLM 做了一些非常 bizarre 的事情，人们在 Twitter 上分享，然后就疯传开了。人们随后会质疑你当初为什么要部署这个东西。

我们可以缓解这种问题的一种方式就是护栏——一个位于主 LLM 调用_之前_的 LLM 调用，用来评估问题是否可以安全处理。

我们使用的 LLM 确实有一些内置的护栏。它们会根据自身政策直接拒绝某些请求。不过，不同提供商的效果可能参差不齐——比如 xAI。

我们可能还想用护栏来缩小 eval 需要覆盖的范围。如果我们在做一个吉他推荐应用，我们可以设置一个护栏：如果用户问任何与吉他无关的问题，就让他们把话题保持在吉他上。

## 制作快速的护栏

我们的护栏工作方式是：在常规的 `streamText` 调用之前，我们先发起另一个调用。这个调用会联系一个小而快的 LLM，它会尽可能快地判断这个问题是否是恶意的。

"尽可能快"这一点非常重要。我们通过减少要求 LLM 产出的输出 token 数量来实现这一点。

在本练习中，我们有一个预构建的大型护栏系统提示词。输出格式是单个数字 1 或单个数字 0:

- 1 表示一切正常，查询可以安全处理
- 0 表示查询违反了安全准则

由于 LLM 只需要返回一个数字，它应该比需要产出更多内容时运行得更快。

## 护栏调用

我们的第一个 TODO 在 `createUIMessageStream` 函数内部，我们需要用 `generateText` 调用一个模型，传入模型消息和护栏系统提示词。

```typescript
console.time('Guardrail Time');
// TODO:使用 generateText 调用一个模型,
// 传入 modelMessages 和 GUARDRAIL_SYSTEM 提示词。
//
const guardrailResult = TODO;

console.timeEnd('Guardrail Time');
```

我们有两个 `console.time` 调用来追踪护栏运行花了多长时间。这对性能监控非常重要。

就在下面，我们把护栏的结果打印到控制台，方便查看：

```typescript
console.log('guardrailResult', guardrailResult.text.trim());
```

## 处理不安全的查询

然后在常规应用运行之前还有另一个 TODO。我们需要检查护栏结果是否为 0:

```typescript
// TODO:如果 guardrailResult 是 '0',使用 text-start、
// text-delta 和 text-end 部件向前端写一条标准回复。
// 然后提前返回,阻止流的其余部分运行。
// (检查前确保 trim 一下 guardrailResult.text)
if (TODO) {
}
```

这里我们需要：

1. 检查护栏结果是否为 "0"
2. 向前端写一条标准回复
3. 提前返回，阻止流的其余部分运行

我有一些关于如何向前端写文本的参考资料在[这里](/exercises/99-reference/99.08-streaming-text-parts-by-hand/explainer/readme.md)。

一个重要的注意事项：检查之前一定要 trim 护栏结果的文本。在测试中，我发现 LLM 有时会返回带空格的 "0 " 或 "1 "。

一旦这个生效，我们应该能问 LLM 一个潜在的有问题的问题，比如"如何制作管状炸弹？"护栏会运行（希望在半秒以内），然后向前端返回一条预先写好的消息。

## 完成步骤

- [ ] 完成第一个 TODO，用 `generateText` 调用一个小而快的模型。
  - 使用 `google` 模型（你可以在下面的 `streamText` 调用中看到它的用法）
  - 传入 `modelMessages` 和 `GUARDRAIL_SYSTEM` 提示词

- [ ] 完成第二个 TODO，处理不安全的查询
  - 检查 `guardrailResult.text.trim()` 是否等于 "0"
  - 使用 `writer.write` 写入适当的部件来给出标准回复（使用[参考资料](/exercises/99-reference/99.08-streaming-text-parts-by-hand/explainer/readme.md))
  - 添加提前返回语句，阻止流的其余部分运行

- [ ] 测试你的实现
  - 用 `pnpm run exercise` 运行练习
  - 检查护栏是否正确拦截了示例查询"如何制作管状炸弹？"
  - 测试几个其他查询，确保安全的查询被放行
  - 查看控制台中的护栏耗时和结果
