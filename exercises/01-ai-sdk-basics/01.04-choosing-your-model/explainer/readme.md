在本课程中，我们将使用一些 AI 模型。你可以选择一个你已经能访问的模型，也可以使用我在课程中默认使用的模型。

## AI SDK 模型提供商

AI SDK 的工作方式是：每个不同的提供商对应不同的包。我在这里安装了三个最常见的：OpenAI、Google 和 Anthropic。

但 AI SDK 附带了几十个[不同的提供商](https://ai-sdk.dev/providers/ai-sdk-providers)供你接入，如果你愿意的话，甚至包括使用本地模型。

## 设置模型

使用一个模型需要做两件事：

1. 安装相关的包
2. 将正确的环境变量添加到你的 `.env` 文件

让我们看看已安装的包：

```ts
// 需要在 .env 中设置 OPENAI_API_KEY 环境变量
import { openai } from '@ai-sdk/openai';

// 需要在 .env 中设置 GOOGLE_GENERATIVE_AI_API_KEY 环境变量
import { google } from '@ai-sdk/google';

// 需要在 .env 中设置 ANTHROPIC_API_KEY 环境变量
import { anthropic } from '@ai-sdk/anthropic';
```

每个提供商都需要一个特定的环境变量：

| 提供商    | 环境变量                       |
| --------- | ------------------------------ |
| OpenAI    | `OPENAI_API_KEY`               |
| Google    | `GOOGLE_GENERATIVE_AI_API_KEY` |
| Anthropic | `ANTHROPIC_API_KEY`            |

## 实例化模型

然后你可以通过直接调用这里的 `openai`、`google` 或 `anthropic` 来实例化模型：

```ts
const model = openai('gpt-4o-mini');

console.dir(model, { depth: null });
```

我在下面打印了模型，只是为了让我们能看到它长什么样。可以看到你得到了一个 OpenAI responses 语言模型。

你还会在模型 ID 上获得自动补全，所以你可以看到所有可用的选项。

## 课程默认模型

现在，我选择了 Google 作为我们的默认选项。所以练习中的大部分代码默认会使用 Google 的 Gemini 模型。原因是：

- 它们极其便宜
- 甚至有免费套餐，只需获取一个 API 密钥即可开始
- 它们运行速度非常非常快
- 对我们的用途来说足够好

不过，如果你想使用 OpenAI 和 Anthropic 的模型，你只需要在开始练习之前把它们换掉。如果你想在整个仓库中替换，做一个智能的查找替换应该也可以。

所以，抓住这个机会设置好你的环境变量并选择你的模型。如果你不确定选哪个，直接获取一个 [Gemini API 密钥](https://aistudio.google.com/apikey)就行。

## 完成步骤

- [ ] 决定你想使用哪个 AI 模型提供商（推荐初学者使用 Google Gemini)

- [ ] 为你选择的提供商创建 API 密钥
  - Google:[注册 Google AI Studio](https://aistudio.google.com/apikey)
  - OpenAI:[创建账户并生成 API 密钥](https://platform.openai.com/api-keys)
  - Anthropic:[注册并获取 API 密钥](https://console.anthropic.com/)

- [ ] 将相应的环境变量添加到你的 `.env` 文件
  - OpenAI:`OPENAI_API_KEY=your-key-here`
  - Google:`GOOGLE_GENERATIVE_AI_API_KEY=your-key-here`
  - Anthropic:`ANTHROPIC_API_KEY=your-key-here`

- [ ] 在下一个练习中，我们将验证设置是否正常工作。
