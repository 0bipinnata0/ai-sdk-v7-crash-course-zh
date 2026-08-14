我们在[护栏](/exercises/09-advanced-patterns/09.01-guardrails/problem/readme.md)中建立的模式——在主 LLM 调用之前添加一个额外的 LLM 调用——可以用于许多有趣的应用。

一个强大的实现是模型路由器（model router)。

模型路由器允许我们根据用户的问题来选择使用哪个模型。我们可以根据查询的复杂程度，把请求路由到不同的 LLM。

不同 LLM 的定价差异可以达到几个数量级。如果我们能把简单的请求路由到更简单（通常也更便宜）的 LLM，同时还能得到好的响应，我们绝对应该这么做。

## 设置结构

我们的设置与上一个练习非常相似：

- 我们在一个 `createUIMessageStream` 内部
- 在两个 `console.time` 调用之间，我们将用 `generateText` 调用一个模型
- 我们传入模型消息，并自己编写系统提示词

```ts
console.time('Model Calculation Time');
// TODO:使用 generateText 调用一个模型,
// 传入 modelMessages,并自己编写系统提示词。
const modelRouterResult = TODO;

console.timeEnd('Model Calculation Time');
```

## 编写提示词

由于这个路由需要尽可能快地运行，我们将使用在护栏练习中用过的同样技巧：

- 返回 0 表示使用基础模型
- 返回 1 表示使用高级模型

我建议你使用我们在前面[章节](/exercises/05-context-engineering/05.01-the-template/explainer/readme.md)中讲过的提示词模板。

输出格式部分会特别重要——规则部分也一样，它将决定在什么情况下使用哪个模型。

## 处理模型选择

接下来，我们需要根据模型路由器的结果来决定使用哪个模型，填入 `modelSelected` 变量：

```ts
// TODO:使用 modelRouterResult 来决定使用哪个模型。
// 如果无法确定使用哪个模型,就使用基础模型。
const modelSelected: 'advanced' | 'basic' = TODO;
```

## 在前端显示模型

我们还想在前端显示使用了哪个模型。为此，我们将使用消息 metadata。

```ts
writer.merge(
  streamTextResult.toUIMessageStream({
    // TODO:把模型添加到消息 metadata 中,
    // 让前端可以显示它。
    messageMetadata: TODO,
  }),
);
```

我们已经设置好了 `MyMessage` 类型，包含一个 `model` 属性：

```ts
export type MyMessage = UIMessage<{
  model: 'advanced' | 'basic';
}>;
```

而我们的 `Message` 组件已经有一个 metadata 属性：

```tsx
<Message
  role={message.role}
  parts={message.parts}
  metadata={message.metadata}
/>
```

在 Message 组件内部，我们可以检查 `model` 属性，如果存在就显示它：

```tsx
{
  metadata?.model && (
    <div className="text-sm text-gray-500 mt-1">
      模型:{metadata.model}
    </div>
  );
}
```

所以你需要做的就是在 `createUIMessageStream` 内部处理把模型传给消息 metadata。之前关于[消息 metadata](/exercises/07-streaming/07.03-message-metadata/problem/readme.md) 的练习会有帮助。

## 测试

完成实现后，你应该能够：

1. 向你的系统提问
2. 系统会为那个答案选择最好的模型
3. 它会用那个模型回复
4. 它会通过消息 metadata 告诉你它用了哪个模型

试着用各种不同的输入测试你的系统，看看它如何在不同模型之间选择，并相应地调整你的系统提示词。

## 完成步骤

- [ ] 用 `generateText` 实现模型路由器
  - 编写一个决定使用基础模型还是高级模型的系统提示词
  - 返回 0 表示基础模型，返回 1 表示高级模型

- [ ] 解析模型路由器的结果来决定使用哪个模型
  - 从 `modelRouterResult.text.trim()` 获取模型选择
  - 如果选择不明确，添加回退到基础模型的逻辑

- [ ] 把模型类型添加到消息 metadata
  - 把选中的模型（'basic' 或 'advanced'）传给消息 metadata

- [ ] 测试你的实现
  - 问一些应该使用基础模型的简单问题
  - 问一些应该使用高级模型的复杂问题
  - 验证模型选择是否出现在 UI 中
  - 根据结果调整你的系统提示词
