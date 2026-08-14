到目前为止，我们在使用 AI SDK 时一直是在"盲飞"。我们向 LLM 发送请求并收到响应，但我们对底层实际发生的事情几乎没有可见性。

[AI SDK](https://ai-sdk.dev/docs/introduction) V6 随附了 [DevTools](https://ai-sdk.dev/docs/ai-sdk-core/devtools)——一个强大的本地开发工具，让你可以检查与语言模型的每一次交互。你可以看到请求负载、响应流、token 使用量，甚至实时观察推理 token 的消耗过程。

在使用 LLM 构建应用时，这种可观测性至关重要。它能帮助你调试问题、了解发送给提供商的内容，并根据实际使用数据优化你的提示词。

## 完成步骤

### 设置 DevTools 中间件

- [ ] 从 `@ai-sdk/devtools` 导入 `devToolsMiddleware`

该中间件来自 [AI SDK DevTools](https://ai-sdk.dev/docs/ai-sdk-core/devtools) 包，允许你拦截和检查 LLM 调用。

- [ ] 用 `wrapLanguageModel()` 包装你的语言模型

使用来自 [AI SDK](https://ai-sdk.dev/docs/introduction) 的 [`wrapLanguageModel()`](https://ai-sdk.dev/docs/reference/ai-sdk-core/wrap-language-model) 函数为你的模型添加中间件。把模型和中间件传给它：

```ts
import { google } from '@ai-sdk/google';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import { wrapLanguageModel } from 'ai';

const model = wrapLanguageModel({
  model: google('gemini-2.5-flash'),
  middleware: devToolsMiddleware(),
});
```

### 启动 DevTools

- [ ] 用 `pnpm run dev` 运行你的开发服务器

这会启动你的本地开发服务器，它将被 DevTools 检测（instrument)。

- [ ] 打开一个新的终端窗口，运行 `npx @ai-sdk/devtools@latest`

这会在 `http://localhost:4983` 启动 DevTools UI。

- [ ] 让两个终端窗口并排保持打开

一个终端运行你的应用，另一个运行 DevTools 界面。

### 测试集成

- [ ] 在浏览器中导航到 `http://localhost:3000`

这是你的应用运行的地方。

- [ ] 向你的 LLM 发出请求(比如问“法国的首都是哪里?”)

通过你的应用 UI 发送一条消息。

- [ ] 切换到 `http://localhost:4983` 的 DevTools 标签页

你现在应该能在 DevTools 界面中看到一个新的运行记录。

- [ ] 点击进入该运行记录，检查其详细信息

探索可用的不同标签页：

- **General**：查看请求耗时和基本指标
- **Usage**：查看详细的 token 计数，包括推理 token（如适用）
- **Request/Response**：检查原始请求负载和流式响应

### 验证完整的可观测性

- [ ] 检查 token 使用明细

注意输入 token、输出 token 以及被消耗的任何推理 token。

- [ ] 查看请求负载

确认你能看到发送给 LLM 提供商的确切内容。

- [ ] 检查流式响应

理解响应是如何从提供商流式返回的。
