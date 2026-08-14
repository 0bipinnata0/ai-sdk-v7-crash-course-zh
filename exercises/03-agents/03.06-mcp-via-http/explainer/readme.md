现在，如果你想在 AI SDK 中使用 MCP 服务器，你需要在本地机器上运行它。这意味着用 `npx` 执行别人库里的代码——这可能让人觉得有风险。

但 MCP 服务器正在世界各地被部署。那么如何在不本地运行代码的情况下连接它们呢？

答案是 [HTTP transport](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools)。你可以把 AI SDK 客户端指向一个外部 API 端点，而不是使用[标准 IO transport](https://ai-sdk.dev/docs/reference/ai-sdk-core/mcp-stdio-transport) 在本地运行 MCP 服务器。

## Transport 类型的工作方式

AI SDK 支持三种不同的 [transport](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools) 类型来连接 MCP 服务器：

| Transport                | 使用场景           | 权衡                                       |
| ------------------------ | ------------------ | ------------------------------------------ |
| 标准 IO                  | 本地 MCP 服务器    | 设置更简单，但在你的机器上执行代码         |
| HTTP                     | 远程 MCP 服务器    | 不执行本地代码，但依赖外部服务             |
| Server-Sent Events (SSE) | 实时远程服务器     | 延迟更低，但支持不够广泛                   |

## 完成步骤

- [ ] 查看 `api/chat.ts` 中的当前设置

当前代码使用[标准 IO transport](https://ai-sdk.dev/docs/reference/ai-sdk-core/mcp-stdio-transport) 在本地运行 MCP 服务器。你需要理解 [`createMCPClient`](https://ai-sdk.dev/docs/reference/ai-sdk-core/create-mcp-client) 的作用以及它目前的工作方式。

- [ ] 用 HTTP transport 替换 transport 配置

把 [`createMCPClient`](https://ai-sdk.dev/docs/reference/ai-sdk-core/create-mcp-client) 调用中的 `transport` 属性改为使用 HTTP。你需要：

- 把 `type` 设置为 `'http'`
- 提供指向远程 MCP 服务器的 `url`
- 添加任何必要的 `headers` 用于身份验证

```ts
import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';

const mcpClient = await createMCPClient({
  transport: {
    type: 'http',
    url: 'https://api.githubcopilot.com/mcp',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
    },
  },
});
```

- [ ] 测试你的实现

运行 `pnpm run dev`，测试同样的请求："给我 mattpocock/ts-reset 仓库的最新 issue。"

智能体应该通过 HTTP 从远程 MCP 服务器获取数据，而不是在本地运行代码。

- [ ] 观察差异

注意 HTTP transport 是如何：

- 让设置更简单（没有本地进程要管理）
- 对你的服务器要求更少
- 仍然得到与本地设置相同的结果

- [ ] 思考权衡

想想如果外部服务宕机会发生什么。使用 HTTP transport 时，你的整个智能体都依赖那个外部 API 的可用性。这是使用远程 MCP 服务器的主要注意事项。
