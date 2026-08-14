之前我们在 AI SDK 返回的 `usage` 上看到了一个有趣的属性：`inputTokenDetails.cacheReadTokens`(在旧版本中叫 `cachedInputTokens`)。

这涉及到一个非常重要的概念，叫做提示词缓存（prompt caching)：模型提供商实际上会为你缓存请求的一部分，这样你在重复请求时就能少花钱。

## 探索提示词缓存

我给你准备了一个可以上手把玩的游乐场，用来探索提示词缓存。这里有几个重要的变量：

想象一下，在之前的请求中，我们把这些 token 送进了缓存："敏捷的棕色狐狸跳过了懒狗"。然后在之后的请求中，我们要发送这些输入 token——和之前一样的内容，然后在结尾多加几个 token。

```ts
const tokensInCache = tokenize(
  `敏捷的棕色狐狸跳过了懒狗`,
);
const inputTokens = tokenize(
  // 注意:修改这里可以改变输入内容
  `敏捷的棕色狐狸跳过了懒狗。多棒的故事啊。`,
);
```

在这下面，我添加了一些模拟提示词缓存实际行为的逻辑。再往下，我们展示了一个漂亮的可视化，说明哪些内容被缓存、哪些没有。

```ts
let numberOfMatchingTokens = 0;
for (let i = 0; i < inputTokens.length; i++) {
  if (inputTokens[i] === tokensInCache[i]) {
    numberOfMatchingTokens++;
  } else {
    break;
  }
}

// 已缓存和未缓存的 token
const cachedTokens = tokensInCache.slice(
  0,
  numberOfMatchingTokens,
);
const uncachedTokens = inputTokens.slice(numberOfMatchingTokens);

// 已缓存和未缓存的输出文本
const cachedText = tokenizer.decode(cachedTokens);
const uncachedText = tokenizer.decode(uncachedTokens);
```

## 缓存的工作原理

如果我们运行这个，可以看到"敏捷的棕色狐狸跳过了懒狗"被缓存了。换句话说，这些会被计为已缓存的输入 token。然后，"多棒的故事啊"会被计为普通的输入 token:

- 已缓存："敏捷的棕色狐狸跳过了懒狗"
- 未缓存："。多棒的故事啊。"

这个缓存的工作方式是：一旦遇到一个不在缓存中的 token，缓存就失效了。所以如果我们把"敏捷"改成"迅捷"，然后再运行一次，可以看到它只缓存了很少的 token。

当然，如果我们完全换掉内容，比如只发送"foo"，再运行一次，最终就完全不会有缓存：

- 已缓存：""
- 未缓存："foo"

## 对话中的缓存

这种缓存行为与大多数聊天应用中对话的实际工作方式相吻合。比如，假设我们的缓存中有这样的内容：一条用户消息，然后是一条助手消息。

```ts
const tokensInCache = tokenize(
  // 注意:修改这里可以改变缓存内容
  [
    '用户:法国的首都是哪里?',
    '助手:巴黎',
  ].join('\n'),
);

const inputTokens = tokenize(
  // 注意:修改这里可以改变输入内容
  [
    '用户:法国的首都是哪里?',
    '助手:巴黎',
    '用户:德国的首都是哪里?',
  ].join('\n'),
);
```

那么，如果我们发送的输入 token 是之前的对话再加上一个新问题，我们可以看到对话之前的所有部分都被缓存了，只有新内容才真正按未缓存的费率收费：

- 已缓存：
  - "用户：法国的首都是哪里？"
  - "助手：巴黎"
- 未缓存：
  - "用户：德国的首都是哪里？"

已缓存的输入 token 和普通的输入 token 按不同的费率计费。你应该查看你的模型提供商的文档，了解那里的缓存是如何工作的。

有些模型提供商明确要求你告诉它们缓存多长时间，有些则使用隐式缓存，也就是自动启用。但它们的工作方式都一样：缓存中有一些内容，在收到新 token 之前的部分都会被缓存。

## 完成步骤

- [ ] 用初始设置[运行游乐场](./main.ts)，观察基本的缓存行为
  - 注意输出中的绿色（已缓存）和红色（未缓存）文本

- [ ] 修改 `tokensInCache` 变量，试验不同的缓存内容
  - 尝试简单句子、对话格式或完全不同的文本

- [ ] 修改 `inputTokens` 变量，测试不同的场景
  - 尝试与缓存完全匹配
  - 尝试与缓存部分匹配
  - 尝试与缓存内容完全不同的文本

- [ ] 通过把两个变量都设置为对话格式，测试[对话场景](../explainer.2/main.ts)
  - 看看添加新消息如何影响缓存

- [ ] 试验只修改输入中的一个词或一个字符，看看它如何影响缓存
  - 观察越靠前的修改会让越多的缓存失效，而越靠后的修改影响越小
