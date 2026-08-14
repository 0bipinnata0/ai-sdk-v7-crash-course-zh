在本课中，我们将探讨在使用 LLM 时，不同的数据格式如何影响 token 效率。理解 token 使用量对于优化你的提示词和上下文窗口至关重要。

## 比较不同的数据格式

我想演示一下如何向 LLM 传递不同类型的数据，并比较它们的 token 效率。让我们看看起点：

```ts
const DATA = [
  {
    url: 'https://aihero.dev',
    title: 'AI Hero',
  },
  {
    url: 'https://totaltypescript.com',
    title: 'Total TypeScript',
  },
  {
    url: 'https://mattpocock.com',
    title: 'Matt Pocock',
  },
  {
    url: 'https://twitter.com/mattpocockuk',
    title: 'Twitter',
  },
];
```

我们有一个 URL 数组，每项都有一个 URL 和一个标题。我们可能会把这些传给 LLM，用于引用或类似的用途。

我们创建了同一数据的三种不同表示形式：

1. XML 格式
2. JSON 格式
3. Markdown 列表格式

```ts
const asXML = DATA.map(
  (item) =>
    `<item url="${item.url}" title="${item.title}"></item>`,
).join('\n');
```

```ts
const asJSON = JSON.stringify(DATA, null, 2);
```

```ts
const asMarkdown = DATA.map(
  (item) => `- [${item.title}](${item.url})`,
).join('\n');
```

## Token 比较结果

运行这段代码时，我们记录了每种格式的 token 数量：

```ts
console.log('Markdown token 数:', tokenize(asMarkdown).length);
console.log(asMarkdown);
console.log('--------------------------------');
console.log('XML token 数:', tokenize(asXML).length);
console.log(asXML);
console.log('--------------------------------');
console.log('JSON token 数:', tokenize(asJSON).length);
console.log(asJSON);
```

结果显示了一些有趣的差异：

| 格式     | Token 数量 |
| -------- | ---------- |
| Markdown | 53 tokens  |
| XML      | 77 tokens  |
| JSON     | 103 tokens |

## 理解格式效率

不要从这个具体例子中得出过于笼统的结论，这一点很重要。以下说法并不总是成立的：

- JSON 总是更大
- XML 总是中等大小
- Markdown 总是最高效

然而，从 token 数量的角度思考这些表示形式，对于优化来说是极有价值的。

上下文工程（我们稍后会讲到）的一个重要方面，就是如何高效地把检索到的数据送进你的 LLM。

一般来说，你把这些数据送进上下文窗口所花的 token 越少，你做得就越好。

## 练习建议

我建议你对这些表示形式做些实验：

1. 尝试添加 markdown 标题，而不仅仅是普通列表
2. 让 XML 更冗长，看看这会如何影响 token 数量
3. 修改 JSON 格式（去掉 `null` 和 `2` 参数，让它变成单行）

目标是理解数据表示形式如何影响 token 数量，以及不同格式在 token 效率上的高低。

祝你好运，我们下一课见。

## 完成步骤

- [ ] 运行现有代码，观察每种格式的 token 数量
  - 使用 `pnpm run dev` 执行代码
  - 记录 markdown(53)、XML(77）和 JSON(103）的 token 数量

- [ ] 修改 markdown 表示形式，加入标题
  - 尝试改变格式，加入标题或其他 markdown 元素
  - 再次运行代码，看看这会如何影响 token 数量

- [ ] 让 XML 表示形式更冗长
  - 添加额外的属性或嵌套元素
  - 将新的 token 数量与原来的比较

- [ ] 试验 JSON 格式
  - 去掉格式化参数（`null, 2`)，让 JSON 变成单行
  - 再次运行代码，看看这是否会减少 token 数量
