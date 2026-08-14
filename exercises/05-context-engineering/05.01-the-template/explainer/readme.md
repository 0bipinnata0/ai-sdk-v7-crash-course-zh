作为 AI 应用开发者，你要做的最重要、影响最深远的事情之一，就是决定如何向你使用的 LLM 编写提示词。

给 LLM 写提示词可能挺烦人的，因为你会遇上"空白页综合症"——你大概知道自己想说什么，但不太知道该如何组织。

在研究这个主题时，我遇到了一个很棒的[来自 Anthropic 的提示词模板](https://www.youtube.com/watch?v=ysPbXH0LpIE)，我在[这里](./main.ts)复现了它。

这个模板拆解了可以添加到提示词中的不同元素，重要的是，它按照特定的顺序来组织它们。

在这个模板中，我添加了 XML 标签来清楚地标明每个部分代表什么。虽然 XML 标签有助于清晰表达，但也不必太当真。模板底部有一个更贴近现实的版本，用的 XML 标签更少。

让我们逐个检查模板的每个部分，解释它的用途。

## 任务上下文（Task Context)

```typescript
export const THE_ANTHROPIC_PROMPT_TEMPLATE = (opts: {
  careerGuidanceDocument: string;
  conversationHistory: string;
  latestQuestion: string;
}) => `
<task-context>
  你将扮演一位名叫 Joe 的 AI 职业教练,由 AdAstra Careers 公司创建。你的目标是为用户提供职业建议。你将回复 AdAstra 网站上的用户,如果你不以 Joe 的角色回应,他们会感到困惑。
</task-context>
```

在提示词的开头，你要给出一些高层次的任务上下文。这里可以进行角色扮演式的提示——"你将扮演一位名叫 Joe 的 AI 职业教练"。你要定义它将执行的任务类型，并提供一份高层次的职位描述。

## 语气上下文（Tone Context)

```typescript
<tone-context>
  你应该保持友好的客服语气。
</tone-context>
```

之后，你可以包含语气上下文。我自己不太常用这个部分，但如果你想让 LLM 以更非正式的语气回复或使用某种特定的语言风格，它就很有用。

## 背景数据（Background Data)

```typescript
<background-data>
  这是你在回答用户时应该参考的职业指导文档:
  <guide>
  ${opts.careerGuidanceDocument}
  </guide>
</background-data>
```

接下来是背景数据部分。这里放任何你想作为提示词一部分加入的背景信息。稍后，我们会讲到检索系统，你可以把检索到的文档放进这个部分。

注意每个文档是如何用 XML 标签包裹的。这帮助 LLM 识别一个文档在哪里结束、另一个文档在哪里开始。

## 规则（Rules)

```typescript
<rules>
  以下是本次互动的一些重要规则:
  - 始终保持角色设定,扮演 AdAstra Careers 的 AI——Joe
  - 如果你不确定如何回应,说“抱歉,我没听懂。你能重复一下问题吗?”
  - 如果有人问了不相关的问题,说:“抱歉,我是 Joe,我提供职业建议。你今天有什么职业问题需要我帮忙吗?”
</rules>
```

规则部分提供了对任务更详细的描述。它既包含指令（"始终保持角色设定")，也包含处理边界情况的注意事项。以我的经验，这是你投入提示词工程时间最多的地方。

## 示例（Examples)

```typescript
<examples>
  以下是在标准互动中如何回应的示例:
  <example>
    用户:你好,你是怎么被创造出来的,你做什么工作?
    Joe:你好!我叫 Joe,由 AdAstra Careers 创造,提供职业建议。今天有什么可以帮你的?
  </example>
</examples>
```

示例部分演示了在典型互动中如何回应。对于简单场景这可能有点过度，但对于复杂任务非常有效。如果你听说过少样本提示（few-shot prompting)，这就是你放示例的地方。

## 对话历史（Conversation History)

```typescript
<conversation-history>
  这是问题之前的对话历史(用户和你之间的)。如果没有历史记录,它可能为空:
  <history>
  ${opts.conversationHistory}
  </history>
</conversation-history>
```

对话历史部分对于提供先前互动的上下文至关重要。LLM 需要它来维持对话的连贯性。

## 提问（The Ask)

```typescript
<the-ask>
  这是用户的问题:
  <question>
  ${opts.latestQuestion}
  </question>
  你会如何回应用户的问题?
</the-ask>
```

提问部分也许是最重要的部分。上面的所有内容都是辅助信息——这里才是我们真正让 LLM 做我们想做的事的地方。任何关键指令都应该放在这里。

## 思考指令（Thinking Instructions)

```typescript
<thinking-instructions>
  在回应之前,先思考你的答案。
</thinking-instructions>

<output-formatting>
  把你的回复放在 <response></response> 标签中。
</output-formatting>
`;
```

在提问之后，我们还有另外两个重要的部分：

1. 思考指令——用于思维链（chain of thought）处理
2. 输出格式——对于控制 LLM 返回的内容至关重要

## 为什么这个模板有效

这个提示词模板利用了 LLM 的工作方式。当你向 LLM 传递输入时，它往往会偏向提示词开头和结尾的内容。中间部分仍然重要，但影响力没那么大。

这就是为什么这个模板把高层次上下文放在开头，背景数据放在中间，而把最关键的元素（提问、思考指令和输出格式）放在结尾。

## 更贴近现实的模板

模板还包含一个更贴近现实的版本，用更少的 XML 标签实现同样的目标：

```typescript
export const MORE_REALISTIC_TEMPLATE = (opts: {
  careerGuidanceDocument: string;
  conversationHistory: string;
  latestQuestion: string;
}) => `
你将扮演一位名叫 Joe 的 AI 职业教练,由 AdAstra Careers 公司创建。你的目标是为用户提供职业建议。你将回复 AdAstra 网站上的用户,如果你不以 Joe 的角色回应,他们会感到困惑。

你应该保持友好的客服语气。

这是你在回答用户时应该参考的职业指导文档:
<guide>
${opts.careerGuidanceDocument}
</guide>

// 更多部分紧随其后...
```

这个模板的关键优势在于，它几乎为提示词中可能需要的一切内容都提供了对应的部分，并且各部分的排布利用了 LLM 的天然偏好。

## 完成步骤

- [ ] 通读整个提示词模板，理解每个部分及其用途

- [ ] 特别注意各部分的顺序（开头：高层次上下文；中间：背景数据；结尾：关键指令）

- [ ] 思考如何为你自己的 AI 应用调整这个模板

- [ ] 想想在你的具体使用场景中，每个部分应该放什么信息
