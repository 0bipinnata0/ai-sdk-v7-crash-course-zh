现在我们对 AI SDK 的工作方式有了更多了解，让我们更深入地探究 LLM 的基础知识。

我们需要了解一下 LLM 的工作原理，因为它们的工作方式所带来的约束，会真真切切地影响你如何围绕它们构建系统。

我们要搞懂的第一个概念是 token。为此我们将使用 tiktokenizer，具体来说是它的[在线游乐场](https://tiktokenizer.vercel.app)。

观看视频，看看它的实际演示。

## 实现 token 计数

在 `main.ts` 中，我们安装了 `js-tiktoken`，这是那个在线游乐场的 JavaScript 实现：

```ts
import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const tokenizer = new Tiktoken(
  // 注意:o200k_base 是 GPT-4o 的分词器
  o200k_base,
);

const tokenize = (text: string) => {
  return tokenizer.encode(text);
};

const input = readFileSync(
  path.join(import.meta.dirname, 'input.md'),
  'utf-8',
);

const output = tokenize(input);

console.log('内容长度(字符数):', input.length);
console.log(`token 数量:`, output.length);
console.dir(output, { depth: null, maxArrayLength: 20 });
```

我们将读取 [`input.md`](./input.md) 中的输入文本。然后对它调用 `tokenize`，它会把文本编码成 token 并返回一个数字数组。

然后我们能看到一些日志，打印出 token、token 数量以及以字符数表示的内容长度。

token 的工作方式是：你通常按 token 计费，所以 token——而不是单词或字符——才是 LLM 世界真正的货币。

值得注意的是，不同语言的分词效率差异很大——中文文本和英文文本产生的 token 数量会很不一样。试着对比一下！

## 完成步骤

- [ ] 打开 [`main.ts`](./main.ts) 文件，查看 [`tokenize`](./main.ts) 函数的现有实现。

- [ ] 尝试修改 [`input.md`](./input.md) 中的输入文本，看看它会输出多少个 token。
