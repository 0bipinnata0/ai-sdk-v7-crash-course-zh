AI SDK 默认情况下并不总是会等待流完成。这很出人意料——当你依赖 `onEnd` 回调被调用时，这可能会坑到你。

## 问题

在这段代码中，我们调用 `streamText`，把 "Hello, world!" 传给 Gemini 2.5 Flash，并且在 `streamTextResult` 上有一个 `onEnd`。

```ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

console.log('进程启动中...');

const streamTextResult = streamText({
  model: google('gemini-2.5-flash'),
  prompt: '你好,世界!',
  onEnd: () => {
    console.log('流已完成!');
  },
});

// 这里没有消费流

console.log('进程退出中...');
```

我们预期流会完成它的工作，然后打印"流已完成！"到终端。

理论上，我们应该得到三条日志：

- "进程启动中..."
- "流已完成！"
- "进程退出中..."

然而，当我们运行这个时，实际上并不是这样。我们得到的是：

- "进程启动中..."
- "进程退出中..."

所以这里的 `onEnd` 实际上从未被调用。"流已完成！"从未真正出现。

## 处理流

这是因为，尽管我们正在接收来自 LLM 的流式数据，但我们实际上没有处理这个流的各个部分。

如果我们处理它们——比如使用 for-await 循环——我们的代码会是这样：

```ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

console.log('进程启动中...');

const streamTextResult = streamText({
  model: google('gemini-2.5-flash'),
  prompt: '你好,世界!',
  onEnd: () => {
    console.log('流已完成!');
  },
});

// 处理流的每个块
for await (const chunk of streamTextResult.textStream) {
  process.stdout.write(chunk);
}

console.log('进程退出中...');
```

然后我们会看到：

- "进程启动中..."
- "你好，今天有什么可以帮你的？"
- "流已完成！"
- "进程退出中..."

所以，处理流的各个部分是确保流完成的一种方式。

## 消费流

然而，有些情况下我们想消费整个流并确保流完成，但不一定需要处理所有部分。或者我们可能想 await 流的结果，同样不一定处理所有的部分。

为此，我们可以使用 `streamTextResult` 上的 `consumeStream()` 方法，如 explainer.1 所示：

```ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

console.log('进程启动中...');

const streamTextResult = streamText({
  model: google('gemini-2.5-flash'),
  prompt: '你好,世界!',
  onEnd: () => {
    console.log('流已完成!');
  },
});

// 这确保流被完全消费
await streamTextResult.consumeStream();

console.log('进程退出中...');
```

这会等待流完成并消费所有部分，然后触发 `onEnd`。

最常见的使用场景是：当你的 `onEnd` 中有持久化逻辑时。因为如果出现网络连接问题，你的流会中断，流不会被完全消费，于是你的 `onEnd` 就不会被触发。

如果我们用 `consumeStream()` 运行，会看到如我们所愿的输出：

- "进程启动中..."
- "流已完成！"
- "进程退出中..."

## 顶层 `consumeStream` 函数

这个能力不仅在 `streamTextResult` 的返回类型上有。还有一个叫做 `consumeStream` 的顶层函数，可以消费一个可读流直到它被完全读取，如 [explainer.2](../explainer.2/main.ts) 所示：

```ts
import { google } from '@ai-sdk/google';
import { consumeStream, streamText } from 'ai';

console.log('进程启动中...');

const streamTextResult = streamText({
  model: google('gemini-2.5-flash'),
  prompt: '你好,世界!',
  onEnd: () => {
    console.log('流已完成!');
  },
});

// 使用顶层的 consumeStream 函数
await consumeStream({
  stream: streamTextResult.toUIMessageStream(),
});

console.log('进程退出中...');
```

我们用 `streamTextResult` 调用 `consumeStream`，并从 `streamTextResult` 创建一个 UI 消息流。所以在功能上，这和之前做的是同一件事，只是多了一步：我们先把它变成 UI 消息流。

运行一下看看是否有效，可以看到我们得到：

- "进程启动中..."
- "流已完成！"
- "进程退出中..."

所以，如果你遇到 `onEnd` 回调没有被调用的情况，很可能某种形式的 `consumeStream` 能帮你确保流完成。

我建议你查看这两个 explainer，多运行几次，试着把它们注释掉又取消注释，试试能不能把它搞坏。

祝你好运，我们下一课见。

## 完成步骤

- [ ] 理解问题：使用 `streamText` 时，如果流没有被消费，`onEnd` 回调就不会执行。

- [ ] 查看 [`explainer.1`](./main.ts) 示例，它使用 `streamTextResult.consumeStream()` 来确保流完成并触发 `onEnd` 回调。

- [ ] 研究 [`explainer.2`](../explainer.2/main.ts) 示例，它使用顶层的 `consumeStream()` 函数配合 `toUIMessageStream()` 实现同样的目标。

- [ ] 通过运行 `pnpm run dev` 尝试运行这两个示例

- [ ] 通过注释掉两个示例中的 `consumeStream` 行来做实验，观察 `onEnd` 回调如何不再执行。

- [ ] 在 `explainer.1` 中，实现一个 for-await 循环来处理流块，看看它如何也能确保 `onEnd` 回调执行：
  - `for await (const chunk of streamTextResult.textStream) { process.stdout.write(chunk); }`

- [ ] 尝试不同的流消费方式组合，理解它们的行为。
