好了，现在你已经知道我们要学什么了，接下来看看你将如何学习。本课程中所有需要动手操作的互动内容，都会在一个 GitHub 仓库中完成。

## 设置 GitHub 仓库

在克隆仓库之前，请确保你已安装：

- [Node.js](https://nodejs.org/en/download) 22 或更高版本
- [pnpm](https://pnpm.io/installation) 9.12.3 或更高版本

所以你的第一项任务是把[仓库](https://github.com/0bipinnata0/ai-sdk-v7-crash-course-zh)克隆下来：

```bash
git clone https://github.com/0bipinnata0/ai-sdk-v7-crash-course-zh.git
cd ai-sdk-v7-crash-course-zh
```

接下来，通过 `pnpm install` 安装依赖：

```bash
pnpm install
```

如果你还没有安装 pnpm，先通过[这个链接](https://pnpm.io/installation)安装。

接下来，把 `.env.example` 文件复制为 `.env`:

```bash
cp .env.example .env
```

## 运行练习

最后，让我演示一下如何运行一个练习。打开终端，运行：

```bash
pnpm dev
```

查看上方的视频，了解会显示什么内容的演示。

## 故障排查

如果在这个设置过程中遇到任何问题，我建议你运行：

```bash
pnpm dev --simple
```

这会给你一个稍微更稳健的体验，当你在不常见的操作系统上操作时很有用。

当然，如果你在设置中遇到任何问题，请在 [Discord](https://aihero.dev/discord) 中告诉我，我会帮你解决。

## 学习本课程

学习本课程的方式是看视频或阅读下面的文字。每一个练习文本的底部都有一个"完成步骤"部分，为你提供了非常清晰的分步指南。

持续完成这些练习，不知不觉中，你就会掌握 AI SDK。如果你有任何问题、疑问或困惑，把它们发到 Discord 里。Discord 就是为此而设的。

非常感谢你学习本课程，我们下一课见。

## 完成步骤

- [ ] 确保已安装 Node.js 22+ 和 pnpm 9.12.3+

- [ ] 将 GitHub 仓库克隆到你的本地机器
  - 使用你偏好的方式在本地克隆
  - [仓库](https://github.com/0bipinnata0/ai-sdk-v7-crash-course-zh)

- [ ] 运行 `pnpm install` 安装依赖
  - 如果你没有 pnpm，先按照[这个链接](https://pnpm.io/installation)安装

- [ ] 设置环境变量
  - 将 `.env.example` 文件复制为 `.env`
  - 我们将在下一课中配置 API 密钥

- [ ] 用 `pnpm dev` 测试运行一个练习
  - 使用方向键或输入搜索来导航练习菜单
  - 选择一个练习运行

- [ ] 如果你遇到任何设置问题，尝试运行 `pnpm dev --simple` 以获得更稳健的体验

- [ ] 如果你有任何问题或需要帮助，加入 [Discord](https://aihero.dev/discord)
