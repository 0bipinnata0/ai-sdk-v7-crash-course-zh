# AI SDK v7 速成课程

> ⚡ **本仓库已全量升级**:所有依赖(含 AI SDK **v7**)、代码示例与教程文档均已适配最新版本。你可以把本仓库的升级提交(`4fab49b` 起)当作一份 **AI SDK v6 → v7 的升级教程** 来参考,主要变更包括:
>
> - `system:` → `instructions:`
> - `onFinish` → `onEnd`、`onStepFinish` → `onStepEnd`
> - `stepCountIs` → `isStepCount`
> - `fullStream` → `stream`
> - `experimental_createMCPClient` → `createMCPClient`(`@ai-sdk/mcp` v2)
> - `experimental_telemetry` → `telemetry`
> - `ModelMessage` 使用 `content`(而非 `parts`)
> - UIMessage part 的 `providerOptions` → `providerMetadata`
> - `usage.cachedInputTokens` → `usage.inputTokenDetails.cacheReadTokens`
> - `generateObject` / `streamObject` → `generateText` / `streamText` + `output` 选项（[为什么这么改？](/docs/why-no-more-stream-object.md))
> - `result.toUIMessageStream()` 等结果方法 → `toUIMessageStream` / `createUIMessageStreamResponse` 等顶层无状态函数
> - 工具定义里的 `needsApproval` → 调用处的 `toolApproval`
> - zod 统一使用 v4 导入
>
> 官方迁移指南见 `node_modules/ai/docs/08-migration-guides/23-migration-guide-7-0.mdx`。

<img src="https://res.cloudinary.com/total-typescript/image/upload/v1770220978/ai-sdk-v5-crash-course-github-thumbnail_3x.jpg" alt="AI SDK 速成课程" />

🚀 **通过 AI Hero 的综合速成课程掌握 AI SDK v7。** 本仓库包含我们动手实践课程中的所有代码示例和练习，课程聚焦于 AI SDK v7——这个令人难以置信的 TypeScript 库正在成为 AI 应用开发的标准。

学习使用 AI SDK v7 的强大功能和现代开发模式构建生产级 AI 应用。课程可在 [aihero.dev](https://aihero.dev) 上获取。

## 🎯 你将掌握的 AI SDK v7 技能

本速成课程将带你从 AI SDK v7 基础一路学到高级生产模式：

- **AI SDK v7 核心概念** - 理解现代 AI 开发工具包
- **AI SDK v7 流式输出** - 使用 `streamText` 构建实时、响应式的 AI 体验
- **工具调用与函数调用** - 创建能够使用外部工具和 API 的 AI 应用
- **消息部件与数据** - 处理结构化的消息组件和自定义数据
- **多提供商支持** - 在 OpenAI、Anthropic、Google 等之间无缝切换
- **文件与图像处理** - 处理和使用多媒体内容
- **高级记忆模式** - 复杂的状态管理和对话处理
- **生产级特性** - 内置的测试、监控和部署能力

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/en/download)(22 或更高版本)
- [pnpm](https://pnpm.io/)(推荐)或 npm/yarn/bun
- 你偏好的 AI 提供商的 API 密钥：
  - [OpenAI](https://platform.openai.com/api-keys)(GPT-4、GPT-3.5)
  - [Anthropic](https://console.anthropic.com/)(Claude)
  - [Google AI Studio](https://aistudio.google.com/apikey)(Gemini)

### 安装设置

1. **克隆本仓库：**

```bash
git clone https://github.com/0bipinnata0/ai-sdk-v7-crash-course-zh.git
cd ai-sdk-v7-crash-course-zh
```

2. **安装依赖：**

```bash
pnpm install
```

3. **配置环境：**

```bash
cp .env.example .env
```

4. **将你的 API 密钥添加到 `.env`**，然后就可以开始学习了！

## 📚 课程结构

从运行 `pnpm dev` 开始：

```bash
pnpm dev
```

这将让你在不同的课程章节之间进行选择。

你也可以运行 `pnpm exercise <exercise-number>` 跳转到特定的练习。

练习运行期间，按 `q` 可以结束当前练习并返回菜单（对长期运行的开发服务器练习特别有用），然后选择“➡️ 运行下一个练习”继续。按 `Ctrl+C` 则会退出整个 CLI。

## 📁 AI SDK v7 课程模块

```
exercises/
├── 01-basics/                    # AI SDK v7 基础
│   ├── 01.1-what-is-the-ai-sdk/
│   ├── 01.2-choosing-a-model/
│   ├── 01.3-stream-text-to-terminal/
│   ├── 01.4-ui-message-streams/
│   ├── 01.5-stream-text-to-ui/
│   └── 01.6-system-prompts/
├── 02-agents/                    # 工具调用与智能体
├── 03-advanced/                  # 高级模式
└── 99-reference/                 # 参考资料
```

## 🛠️ 学习工作流

每个练习都遵循以下学习结构：

### `problem/` 文件夹

- **你的编码练习场** - 从这里开始！
- 包含带有详细说明的 `readme.md`
- 代码文件中带有 `TODO` 注释，等待你来实现

### `solution/` 文件夹

- **参考实现** - 卡住的时候查看
- 每个练习的完整、可运行的代码
- 非常适合对比方案和学习最佳实践

### `explainer/` 文件夹

- **深入讲解** - 额外的解释和概念
- 对复杂主题的扩展演练
- 非常适合巩固你的理解

## 🤝 获取帮助

1. **查看解决方案** - 每个练习都有完成的版本
2. **验证你的设置** - 确保 API 密钥和依赖项配置正确
3. **观看课程** - 完整讲解可在 [aihero.dev](https://aihero.dev) 上获取

准备好掌握 AI SDK v7 并成为 AI 开发专家了吗？让我们开始构建未来吧！🚀
