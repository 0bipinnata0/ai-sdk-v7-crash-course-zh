和 LLM 聊天固然不错，也确实有用。你可以用它来做"橡皮鸭调试"，把想法讲清楚，但你的系统无法在现实世界中做任何事。

把 LLM 和现实世界连接起来的一种简单方式，是给它们提供一组可以调用的工具。这就是我们在这个练习中要做的事情。

我们要做的所有工作都在 POST 请求里。这里有一个 [`streamText`](./api/chat.ts) 调用，它告诉 LLM：它是一个乐于助人的助手，可以使用沙箱文件系统来创建、编辑和删除文件。

```ts
export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const result = streamText({
    model: openai.chat('gpt-5.5'),
    messages: await convertToModelMessages(messages),
    instructions: `
      你是一个乐于助人的助手,可以使用沙箱文件系统来创建、编辑和删除文件。

      你可以使用以下工具:
      - writeFile
      - readFile
      - deletePath
      - listDirectory
      - createDirectory
      - exists
      - searchFiles

      使用这些工具为用户记录笔记、创建待办事项列表和编辑文档。

      使用 markdown 文件来存储信息。
    `,
    // TODO:把工具添加到 streamText 调用中
    tools: TODO,
    // TODO:给 streamText 调用添加一个自定义停止条件,
    // 强制智能体在执行 10 步后停止
    stopWhen: TODO,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
};
```

它告诉 LLM 它可以访问以下工具：写文件、读文件、删除路径、列出目录、创建目录等等。它将用这些工具为用户记录笔记、创建待办事项列表和编辑文档。

不过问题是，我们实际上还没有把这些工具提供给智能体。所以我们需要把工具添加到这个 [`streamText`](./api/chat.ts) 调用中。

作为一位慷慨的老师，我为你提供了 [`file-system-functionality.ts`](./api/file-system-functionality.ts) 文件，其中包含一堆可以用来创建、读取和删除文件的函数。

```ts
export function writeFile(
  filePath: string,
  content: string,
): { success: boolean; message: string; path: string } {
  try {
    // 实现细节...
    return {
      success: true,
      message: `文件写入成功:${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    // 错误处理...
  }
}

export function readFile(filePath: string): {
  success: boolean;
  content?: string;
  message: string;
  path: string;
} {
  try {
    // 实现细节...
    return {
      success: true,
      content,
      message: `文件读取成功:${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    // 错误处理...
  }
}
```

你的任务是研究这个文件系统功能文件，把所有这些函数接入到 LLM 可以调用的工具中。要创建一个工具，你需要使用 AI SDK 中的 [`tool`](./api/chat.ts) 函数。

```ts
// 创建工具的示例
import { tool } from 'ai';
import { z } from 'zod';

// 这只是工具结构的示例
const exampleTool = tool({
  description: '描述这个工具做什么',
  inputSchema: z.object({
    param1: z.string().describe('参数 1 的描述'),
    param2: z.number().describe('参数 2 的描述'),
  }),
  execute: async ({ param1, param2 }) => {
    // 使用参数的实现
    return { result: 'some result' };
  },
});
```

但你的任务不止于此。当 LLM 调用一个工具时，它必须先调用工具，然后等待响应，再读取响应。这意味着我们实际上要多次调用 LLM。

1. 第一次是为了弄清楚要调用哪个工具
2. 然后是它想如何回应刚刚得到的结果？

AI SDK 已经为此做好了准备。你只需要通过 `stopWhen` 提供一个自定义停止条件。有很多自定义停止条件可以用，但我认为你应该强制智能体在执行大约 10 步后停止。

你会发现 `ai` 包中的 [`isStepCount`](./api/chat.ts) 函数对此很有用：

```ts
import { isStepCount } from 'ai';
```

智能体_可能_在那之前就自己停止了。但指定最大步数意味着智能体不会永远运行下去。

指定好工具和 `stopWhen` 条件之后，试着运行练习并测试 UI，看看能不能让它创建和删除一些文件。它被沙箱限制在特定目录中，所以你不用担心它会删掉你的整个系统。

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 在 `chat.ts` 中导入所需的依赖：

```ts
import { tool, isStepCount } from 'ai';
import { z } from 'zod';
import * as fsTools from './file-system-functionality.ts';
```

- [ ] 使用 `tool()` 函数为每个文件系统函数创建工具定义。查看 `file-system-functionality.ts` 文件中每个函数的参数和返回类型，以确定正确的输入 schema。查看[参考资料](/exercises/99-reference/99.02-defining-tools/explainer/readme.md)，了解如何使用 `tool()` 函数的更多信息。

- [ ] 创建一个包含所有工具定义的 `tools` 对象

- [ ] 添加一个 `stopWhen` 条件来限制智能体可以执行的步数。查看[文档](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#multi-step-calls-using-stopwhen)了解更多信息。

- [ ] 运行本地开发服务器，通过让 LLM 创建待办事项列表或其他文件相关任务，测试它能否通过 UI 创建和管理文件。
