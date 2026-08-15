在本练习中，我们将构建一个研究工作流。我们应该能向系统提问，它会搜索网络并在综合大量信息之后为我们提供回答。

这将比之前的练习更加自由，给你更多按自己的方式解决问题的空间。

你需要一个 [Tavily API 密钥](https://tavily.com/)来让搜索功能工作——注册是免费的。

## 设置

我们的系统遵循四步流程：

1. 为 [Tavily](https://tavily.com/) 生成搜索查询（类似于谷歌搜索）
2. 把这些查询和一个研究计划流式传输到前端
3. 调用 Tavily 获取搜索结果
4. 向用户流式输出最终总结

让我们看看代码结构，了解需要实现什么。

主要功能定义在 `chat.ts` 文件中，其中包含几个需要实现的函数：

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    const queriesResult =
      await generateQueriesForTavily(modelMessages);

    await displayQueriesInFrontend(queriesResult, writer);

    const scrapedPages = await callTavilyToGetSearchResults(
      (await queriesResult.object).queries,
    );

    await streamFinalSummary(
      scrapedPages,
      modelMessages,
      writer,
    );
  },
});
```

## `generateQueriesForTavily`

第一个函数需要使用 `streamObject`，基于对话历史生成一个计划和查询：

```ts
const generateQueriesForTavily = (
  modelMessages: ModelMessage[],
) => {
  // TODO:使用 streamObject 生成搜索计划,
  // 以及用于在网上搜索信息的查询。
  // 计划应该识别出回答问题所需的信息分组。
  // 计划应该列出回答问题所需的信息点,
  // 然后考虑如何把这些信息拆解成查询。
  // 生成 3-5 个与对话历史相关的查询。
  // 以 JSON 对象回复,包含以下属性:
  // - plan:描述查询计划的字符串。
  // - queries:字符串数组,每个元素代表一个查询。
  const queriesResult = TODO;

  return queriesResult;
```

你需要用 `streamObject` 生成一个带有 `plan` 和 `queries` 属性的对象来替换 `TODO`。

## `displayQueriesInFrontend`

接下来，你需要实现把查询和计划流式传输到前端的函数：

```ts
const displayQueriesInFrontend = async (
  queriesResult: ReturnType<typeof generateQueriesForTavily>,
  writer: UIMessageStreamWriter<MyMessage>,
) => {
  const queriesPartId = crypto.randomUUID();
  const planPartId = crypto.randomUUID();

  for await (const part of queriesResult.partialObjectStream) {
    // TODO:把查询和计划流式传输到前端
    TODO;
  }
};
```

你需要使用 `writer`，在部分对象可用时把它们流式传输出去。

## `callTavilyToGetSearchResults`

有一个函数我已经为你实现好了：`callTavilyToGetSearchResults`，它调用 Tavily API 来获取搜索结果：

```ts
const callTavilyToGetSearchResults = async (
  queries: string[],
) => {
  const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY,
  });

  const searchResults = await Promise.all(
    queries.map(async (query) => {
      const response = await tavilyClient.search(query, {
        maxResults: 5,
      });

      return {
        query,
        response,
      };
    }),
  );

  return searchResults;
};
```

注意我们每个查询获取 `5` 条结果——你可能想试试调整这个数字。

## `streamFinalSummary`

最后，你需要实现总结生成：

```ts
const streamFinalSummary = async (
  searchResults: Awaited<
    ReturnType<typeof callTavilyToGetSearchResults>
  >,
  messages: ModelMessage[],
  writer: UIMessageStreamWriter<MyMessage>,
) => {
  // TODO:使用 streamText 生成给用户的最终回复。
  // 回复应该是搜索结果的总结,
  // 并附上信息来源。
  const answerResult = TODO;

  writer.merge(
    // 注意:我们传入 sendStart: false,因为我们已经
    // 向前端发送过 'start' 消息部件了。
    // 否则,我们最终会在前端得到两条助手消息。
    toUIMessageStream({
      stream: answerResult.stream,
      sendStart: false,
    }),
  );
};
```

这个函数应该使用 `streamText`，基于搜索结果生成一份全面的总结。

改进实现的一种方式是：在总结中包含 markdown 链接。这允许用户点击跳转到原始来源，提升用户体验。

总结应该包含对来源的引用，格式化为可点击的链接，让用户可以顺着它们去验证信息。

## 测试

实现所有函数之后，你可以用不同的查询测试你的方案。提供的示例查询是：

```tsx
const [input, setInput] = useState(
  `燃气灶、电陶炉和电磁灶,哪个更好?请给出详细的回答。`,
);
```

## 完成步骤

- [ ] 设置你的 Tavily API 密钥（如果还没有的话）
  - 在 [Tavily](https://tavily.com/) 注册
  - 把你的 API 密钥添加到环境变量 `TAVILY_API_KEY` 中

- [ ] 实现 `generateQueriesForTavily` 函数
  - 使用 `streamObject` 生成计划和查询
  - 对象应该有 `plan`（字符串）和 `queries`（字符串数组）属性

- [ ] 实现 `displayQueriesInFrontend` 函数
  - 把计划和查询流式传输到前端
  - 使用 `writer` 以相应的 ID 更新部件

- [ ] 实现 `streamFinalSummary` 函数
  - 使用 `streamText` 基于搜索结果生成总结
  - 在总结中包含指向来源的 markdown 链接

- [ ] 测试你的实现
  - 用 `pnpm run exercise` 运行练习
  - 用不同的查询测试，确保它正常工作
  - 验证前端是否正确显示计划、查询和总结
