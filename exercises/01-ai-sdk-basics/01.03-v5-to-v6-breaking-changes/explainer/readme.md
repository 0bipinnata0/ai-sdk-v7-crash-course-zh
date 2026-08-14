# V5 到 V6 的破坏性变更

本课程使用 AI SDK v6。如果你是从 v5 迁移过来的，以下是需要注意的关键破坏性变更。

## `convertToModelMessages` 现在是异步的

在 v5 中，`convertToModelMessages` 是同步的：

```ts
// v5
const modelMessages = convertToModelMessages(messages);
```

在 v6 中，它是异步的，必须 await:

```ts
// v6
const modelMessages = await convertToModelMessages(messages);
```

## MCP 导入移至 `@ai-sdk/mcp`

MCP 相关的导入已移至专门的包：

```ts
// v5
import { createMCPClient } from 'ai';
import { StdioMCPTransport } from 'ai/mcp-stdio';

// v6
import { createMCPClient } from '@ai-sdk/mcp';
import { StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';
```

## 用于结构化生成的 `Output.object`

v6 引入了 `Output.object`，作为使用 `generateText` 和 `streamText` 生成结构化对象的新方式：

```ts
import { Output } from 'ai';

const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Generate a recipe',
  output: Output.object({
    schema: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
    }),
  }),
});

console.log(result.object); // 类型化的对象
```

`generateObject` 和 `streamObject` 在 v6 中仍然可用。

## 用于智能体工作流的 `ToolLoopAgent`

v6 新增了 `ToolLoopAgent`，用于多步骤工具调用：

```ts
import { ToolLoopAgent } from 'ai';

const agent = new ToolLoopAgent({
  model: openai('gpt-4o'),
  instructions: 'You are a helpful assistant',
  tools: { myTool },
});
```

这取代了使用 `maxSteps` 的手动 `while` 循环。

---

这并不是全部内容——查看 [AI SDK 更新日志](https://ai-sdk.dev/changelog)了解完整细节。
