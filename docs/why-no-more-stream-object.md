# 为什么 v7 废弃了 `generateObject` 和 `streamObject`?

在 AI SDK v7 中，`generateObject` 和 `streamObject` 被标记为废弃（deprecated)，官方推荐用 `generateText` / `streamText` 配合 `output` 选项来替代。这不是一次随意的改名，背后有三层原因。

## 1. 两套 API 收敛成一套

v6 及以前是四条平行路径：

```
generateText    streamText      ← 文本系
generateObject  streamObject    ← 对象系
```

object 系其实是"text 系的子集 + schema"——模型、prompt、tools、telemetry 这些选项两边都有。SDK 团队要维护两套，学习者要学两套，而且 object 系的功能经常滞后（比如它不支持 `stopWhen` 多步控制）。

v7 的做法：结构化输出只是 `streamText` 的一个 `output` 选项，四条路径收成两条。

## 2. 最本质的原因：可组合性

v7 官方文档直接点破了这一点：

> "Structured output generation is part of the `generateText` and `streamText` flow. **This means you can combine it with tool calling in the same request.**"
>
> "Structured output generation **counts as a step** in the AI SDK's multi-turn execution model."

旧的 `streamObject` 是**单步**的：模型一轮生成直接出对象，中途不能调工具。而在新模型里，结构化输出是**多步执行模型中的一步**——agent 可以先跑几轮工具调用，最后一步输出结构化结果。

举个例子：一个研究助手的 agent 在生成搜索计划时，如果模型觉得信息不够、想先调一次搜索工具再产出计划——`streamObject` 在架构上做不到，`streamText + output + stopWhen` 天然支持。

## 3. 底层技术也变了

早期结构化输出是靠 **function-calling hack** 实现的：定义一个假工具，逼模型"调用"它来输出 JSON——所以需要独立的 `generateObject` 函数来包这层戏法。

现在 OpenAI 等提供商**原生支持** structured outputs(`response_format` 直接接受 JSON schema)，结构化输出退化成了"对文本生成的一种输出格式约束"，独立函数就没有存在必要了。

## 迁移对照

```ts
// 旧(v7 中已废弃)
const result = streamObject({ schema });
for await (const part of result.partialObjectStream) { ... }
const finalObject = await result.object;

// 新(v7 推荐)
const result = streamText({ output: Output.object({ schema }) });
for await (const part of result.partialOutputStream) { ... }
const finalObject = await result.output;
```

`generateObject` → `generateText` 的迁移同理。

## 一句话总结

> 结构化输出从"另一种生成函数"降级为"生成的一个选项"，换来的是和工具调用、多步循环的自由组合。

废弃而非直接删除，是因为 `streamObject` 用得太广——v7 里它还能运行（会有 deprecation 警告），下个大版本才会真正移除。
