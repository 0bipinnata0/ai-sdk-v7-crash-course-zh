对于任何 AI 驱动的应用来说，改进它的最重要的一件事，可能就是观察它在生产环境中的表现。

原因是：你从用户使用你的应用中得到的数据总是高质量的——因为它精确地反映了人们实际_使用_它的方式。

你还可以用它来帮助你的数据覆盖率——通过发现你可能想都没想过的新的边界情况。这些用户数据随后可以直接用在你的 eval 中，帮助改进它们。

不仅如此，当我们如此重度地依赖付费服务时，可观测性绝对是关键。我们需要了解自己花了多少钱，并寻找在提示词之间优化 token 使用的方法。

## LangFuse

有很多专为 LLM 可观测性打造的工具，但我要向你展示的是 [LangFuse](https://langfuse.com/)。LangFuse 很有意思，因为他们有云服务，但_也_允许你用 Docker 在本地运行整个系统。

为了简单起见，我建议你注册他们[云服务](https://cloud.langfuse.com/)的免费试用。完成后，你需要在 `.env` 文件中配置三个环境变量：

```
LANGFUSE_PUBLIC_KEY=your_public_key
LANGFUSE_SECRET_KEY=your_secret_key
LANGFUSE_BASE_URL=https://cloud.langfuse.com
```

你会在入门引导流程中接触到它们。

## 设置

在本练习中，我们将把之前创建的聊天标题生成系统接入监控，让我们能够观察它在生产环境中的运行情况。

在这个实现中，我们将让标题生成与聊天并行运行。这意味着如果我们要持久化聊天，就能立即把生成的标题一起持久化。

我们的第一项任务是打开 [`langfuse.ts`](./api/langfuse.ts) 文件做一些配置。Langfuse 的新版 SDK(`@langfuse/*` 系列包）基于 OpenTelemetry。我们需要：

1. 实例化来自 `@langfuse/otel` 包的 `LangfuseSpanProcessor`——它负责把 span 发送给 Langfuse
2. 实例化来自 `@opentelemetry/sdk-node` 包的 `NodeSDK` 类，把 span processor 放进 `spanProcessors` 数组
3. 调用 `otelSDK.start()`
4. 使用 `ai` 包中的 `registerTelemetry` 注册来自 `@langfuse/vercel-ai-sdk` 包的 `LangfuseVercelAiSdkIntegration`——这是专为 AI SDK v7 打造的遥测集成

这些 `TODO` 看起来像这样：

```ts
// langfuse.ts
import { LangfuseSpanProcessor } from '@langfuse/otel';
import { LangfuseVercelAiSdkIntegration } from '@langfuse/vercel-ai-sdk';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { registerTelemetry } from 'ai';

// TODO:创建 LangfuseSpanProcessor 实例并导出
export const langfuseSpanProcessor = TODO;

// TODO:创建 NodeSDK 实例,把 span processor
// 传入 spanProcessors 数组
export const otelSDK = TODO;

otelSDK.start();

// TODO:注册 Langfuse 的 AI SDK v7 遥测集成
TODO;
```

`langfuseSpanProcessor` 和 `otelSDK` 会从环境变量中自动读取 Langfuse 的密钥配置，不需要手动实例化客户端。

## 追踪代码

完成这些之后，我们就可以进入有趣的部分：真正追踪我们的代码。我们的第一项工作在 [`chat.ts`](./api/chat.ts) 的 `POST` 路由中。我们将使用 `@langfuse/tracing` 包中的 `propagateAttributes` 函数，把请求处理逻辑包起来，并传入 `sessionId`（也就是聊天的 ID):

```ts
import { propagateAttributes } from '@langfuse/tracing';

return propagateAttributes(
  {
    sessionId: body.id,
  },
  async () => {
    // 这里面的所有模型调用
    // 都会归属到同一个 trace
  },
);
```

这样，`propagateAttributes` 回调内部进行的所有 AI SDK 调用都会被关联到同一个 trace 中。

### Trace 和 Span

LangFuse 基于 [OpenTelemetry](https://opentelemetry.io/)，这意味着它使用 trace 和 span 的概念。

你可以把 span 想象成一个工作单元。比如，一次函数调用可能就是一个 span。在我们的例子中，`streamText` 调用就是我们的 span。第一个 span 是写聊天消息，第二个是生成标题。

trace 则像是一个装 span 的容器。它像是整个事情经过的完整故事。

```
┌──────────────────────────────────────────────┐
│                    TRACE                     │
├──────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐  │
│  │     SPAN 1      │    │     SPAN 2      │  │
│  │  写聊天消息     │    │    生成标题     │  │
│  └─────────────────┘    └─────────────────┘  │
└──────────────────────────────────────────────┘
```

### 给 `streamText` 和 `generateText` 调用传入 `telemetry`

设置好 `propagateAttributes` 之后，我们应该进入 `streamText` 调用和 `generateText` 调用，查看 `telemetry` 属性。

AI SDK v7 内置了对 telemetry 的支持——注册了遥测集成之后，所有调用默认都会上报，不再需要 `isEnabled: true`。我们只需要把这个 `TODO` 替换成一个带有 `functionId` 属性的对象：

```ts
// 把这个:
telemetry: TODO,

// 替换成类似这样的:
telemetry: {
  functionId: 'your-name-here',
},
```

`functionId` 应该用来描述正在执行的动作，它会作为 observation 的名称显示在 Langfuse 中。

### 刷新 trace

完成之后，我们可以一直到代码末尾的 `onEnd`。

在 `onEnd` 中，我们需要使用 `langfuseSpanProcessor.forceFlush` 方法刷新 LangFuse 的 trace。这里的"刷新"意思是把缓冲的 span 立即发送给 LangFuse，这样我们就能在它的云端查看器中查看它们。

```ts
onEnd: async () => {
  // TODO:使用 langfuseSpanProcessor.forceFlush 方法
  // 刷新待发送的 trace,并 await 结果
  TODO;
};
```

### 测试

完成所有这些 TODO 之后，你可以试着测试你的应用，再次确认你的环境变量都已正确配置。

你可以进入 LangFuse 仪表盘的 traces 部分，看到你的 trace 不断进来。你将能在单个 trace 中看到标题生成和聊天消息写入。

祝你好运，我们解答部分见。

## 完成步骤

- [ ] 注册一个免费的 [LangFuse](https://langfuse.com) 账户，获取你的 API 密钥

- [ ] 在你的 `.env` 文件中添加三个环境变量：

  ```
  LANGFUSE_PUBLIC_KEY=your_public_key
  LANGFUSE_SECRET_KEY=your_secret_key
  LANGFUSE_BASE_URL=https://cloud.langfuse.com
  ```

- [ ] 在 [`langfuse.ts`](./api/langfuse.ts) 中实现 `langfuseSpanProcessor` 和 `otelSDK`

- [ ] 在 [`langfuse.ts`](./api/langfuse.ts) 中用 `registerTelemetry` 注册 `LangfuseVercelAiSdkIntegration`

- [ ] 在 [`chat.ts`](./api/chat.ts) 中用 `propagateAttributes` 包裹请求处理逻辑并传入 `sessionId`

- [ ] 给 [`chat.ts`](./api/chat.ts) 中的 `streamText` 调用和 `generateText` 调用添加 `telemetry`

- [ ] 在 `onEnd` 处理器中实现 `langfuseSpanProcessor.forceFlush()` 调用

- [ ] 通过运行本地开发服务器测试你的应用

- [ ] 检查 LangFuse 仪表盘，看看 trace 是否被记录

- [ ] 尝试不同的提示词，看看它们在 trace 视图中如何呈现
