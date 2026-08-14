让我们看看 AI SDK 最基础的功能：生成文本。生成文本需要两个输入：

- 一个你要使用的模型
- 一个你要传给该模型的提示词（prompt)

我在 [`main.ts`](./main.ts) 文件里给你留了几个 TODO。第一个 TODO 是选择一个模型并实例化它。这意味着从这里的 `@ai-sdk/google` 导入中取出 `google` 函数，然后用你想选择的模型来调用它。

```ts
// 导入必要的函数
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// TODO:选择一个模型。我推荐使用 GPT 模型:
// gpt-5.5
const model = TODO;
```

我们这里有一个询问法国首都是哪里的提示词：

```ts
const prompt = '法国的首都是哪里?';
```

然后这个 `result` 将是我们从这里从 `ai` 包中调用的 [`generateText`](./main.ts) 的结果。你要调用 `generateText`，传入你选择的模型和提示词，然后 await 它并拿到结果。

```ts
const result = TODO; // TODO:使用 generateText 获取结果
```

最后，我们将 `console.log` 输出文本：

```ts
console.log(result.text);
```

这意味着当你运行这个练习时，你应该能看到我们调用的 LLM 回答我们提出的问题。

就是这样，一个不错、简单的入门练习。

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 通过将模型声明中的 `TODO` 替换为 GPT 模型来选择一个模型。

- [ ] 通过替换 result 声明中的 `TODO`，使用 `generateText` 函数获取结果。

- [ ] 运行代码并检查终端输出，验证你是否得到了关于法国首都的回答。

- [ ] 如果卡住了，查看解答。
