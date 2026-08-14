为你的智能体提供工具集的一种方式是通过 MCP。

MCP，即[模型上下文协议](https://modelcontextprotocol.io/docs/getting-started/intro)(Model Context Protocol)，是一个协议，你可以用它把你的客户端（在我们的例子中就是我们正在构建的应用）连接到 MCP 服务器。

MCP 服务器可以暴露工具集——换句话说，就是作为客户端的你可以调用的函数，用来在现实世界中做事。

比如，我们将要使用的 [GitHub MCP 服务器](https://github.com/github/github-mcp-server)，可以让你创建仓库、查找文本文件、关闭 issue、发起 pull request，以及各种其他有用的 GitHub 操作。

通过把这些预构建的工具接入我们的系统，我们将走上做出真正有用的东西的快速通道。

幸运的是，AI SDK 有几个函数可以帮助你做到这一点。

## 练习

在本练习中，我们将只在 [`POST`](./api/chat.ts) 路由中工作。

我们首先会看几个从 [`@ai-sdk/mcp`](./api/chat.ts) 导入的函数。它们当然是实验性的，因为 MCP 里的一切都是实验性的，我们将在下面的代码中使用它们。

在开始流式传输之前，我们需要初始化一个 MCP 客户端。这将使用来自 `@ai-sdk/mcp/mcp-stdio` 的 [`StdioMCPTransport`](./api/chat.ts)。

```ts
import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio';
```

这将在本地运行一个进程，并监控它的 `stdin` 和 `stdout`，以便与它通信。

你需要在 Docker 容器中运行 GitHub MCP 服务器。这是他们推荐的方式。

为了让你免去我集成时经历的痛苦，这里是设置代码：

```ts
const myTransport = new StdioMCPTransport({
  command: 'docker',
  args: [
    'run',
    '-i',
    '--rm',
    '-e',
    'GITHUB_PERSONAL_ACCESS_TOKEN',
    'ghcr.io/github/github-mcp-server',
  ],
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN:
      process.env.GITHUB_PERSONAL_ACCESS_TOKEN!,
  },
});
```

对于还没有 Docker 的同学，如果你还没安装，需要下载 [Docker Desktop](https://www.docker.com/products/docker-desktop/)。你还需要获取一个 GitHub [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)(个人访问令牌)。

给你的令牌一些基本权限，然后把它放进仓库根目录的 `.env` 文件中：

```
GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
```

MCP 客户端设置好之后，你需要获取它的工具，并把这些工具传给 [`streamText`](./api/chat.ts)。MCP 客户端会有一个 `tools` 方法，你可以调用它来获取工具。

## 关闭 MCP 客户端

最后，因为我们自己运行 MCP 服务器（这就是 `StdioMCPTransport` 所做的事情——它启动 MCP 服务器），我们需要在完成后手动关闭它。

所以在 [`onFinish`](./api/chat.ts) 回调中，我们要通过调用 `mcpClient.close()` 来关闭连接。

对我们来说，这意味着当请求发出时，我们启动 GitHub MCP 服务器；当请求完成时，我们把它关掉。这可能不是最理想的方式，但目前是可行的。

一旦这一切设置好并正常工作，你就能通过自己构建的工具与你自己的 GitHub 账户交互了。

为什么不让它列出你熟悉的某个仓库的 issue，甚至让它调查一个你不太了解的仓库呢？祝你好运！

## 完成步骤

- [ ] 获取一个 [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) 并把它添加到你的 `.env` 文件

- [ ] 如果你还没有安装，安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)

- [ ] 使用 `createMCPClient` 函数和 `StdioMCPTransport` 类创建一个 MCP 客户端，连接到 GitHub MCP 服务器。提醒一下，这是设置 transport 的方式。查看[这些文档](https://ai-sdk.dev/docs/reference/ai-sdk-core/create-mcp-client)了解更多信息。

```ts
const myTransport = new StdioMCPTransport({
  command: 'docker',
  args: [
    'run',
    '-i',
    '--rm',
    '-e',
    'GITHUB_PERSONAL_ACCESS_TOKEN',
    'ghcr.io/github/github-mcp-server',
  ],
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN:
      process.env.GITHUB_PERSONAL_ACCESS_TOKEN!,
  },
});
```

- [ ] 使用 `mcpClient.tools()` 方法获取工具，并把它们传给 `streamText` 函数。

- [ ] 实现 `onFinish` 回调，在流结束时关闭 MCP 客户端

```ts
onFinish: async () => {
  // 关闭 MCP 客户端
},
```

- [ ] 通过运行本地开发服务器并让智能体与 GitHub 交互（比如获取某个仓库的 issue）来测试你的实现
