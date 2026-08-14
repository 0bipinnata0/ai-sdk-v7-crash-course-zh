我们已经看到了如何使用自定义数据部件把自定义对象、自定义结构流式传输到前端。但如果你有一个想覆盖另一个数据部件的数据部件，该怎么办？

一个经典的例子是"当前状态"数据部件：比如，正在加载，然后正在搜索网络，然后正在抓取一些页面，然后正在总结：

```txt
加载中...
正在搜索网络...
正在抓取页面...
正在总结...
```

你肯定不希望它们在 UI 中显示为四个不同的元素。你希望它们显示为一个随时间变化的单一状态。

我们可以通过给每个数据部件提供一个稳定的 ID 来建模这个需求。

```ts
const stream = createUIMessageStream<MyMessage>({
  execute: async ({ writer }) => {
    const helloId = crypto.randomUUID();
    const goodbyeId = crypto.randomUUID();

    // 初始状态:没有部件
    // messageParts = []

    writer.write({
      type: 'data-hello',
      id: helloId,
      data: 'Bonjour!',
    });

    // 第一次写入后:
    // messageParts = [
    //   {
    //     type: 'data-hello',
    //     id: helloId,
    //     data: 'Bonjour!'
    //   }
    // ]

    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-goodbye',
      id: goodbyeId,
      data: 'Au revoir!',
    });

    // 第二次写入后:
    // messageParts = [
    //   {
    //     type: 'data-hello',
    //     id: helloId,
    //     data: 'Bonjour!'
    //   },
    //   {
    //     type: 'data-goodbye',
    //     id: goodbyeId,
    //     data: 'Au revoir!'
    //   }
    // ]

    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-hello',
      id: helloId,
      data: 'Guten Tag!',
    });

    // 第三次写入后——注意 helloId 部件是被更新了,而不是新增:
    // messageParts = [
    //   {
    //     type: 'data-hello',
    //     id: helloId,
    //     data: 'Guten Tag!'  // 从 'Bonjour!' 更新而来
    //   },
    //   {
    //     type: 'data-goodbye',
    //     id: goodbyeId,
    //     data: 'Au revoir!'
    //   }
    // ]

    await new Promise((resolve) => setTimeout(resolve, 1000));

    writer.write({
      type: 'data-goodbye',
      id: goodbyeId,
      data: 'Auf Wiedersehen!',
    });

    // 第四次写入后——goodbye 部件被更新了:
    // messageParts = [
    //   {
    //     type: 'data-hello',
    //     id: helloId,
    //     data: 'Guten Tag!'
    //   },
    //   {
    //     type: 'data-goodbye',
    //     id: goodbyeId,
    //     data: 'Auf Wiedersehen!'  // 从 'Au revoir!' 更新而来
    //   }
    // ]
  },
});
```

仅仅通过提供稳定 ID 这个小改动，我们就能看到消息部件如何随时间变化。当我们写入一个已存在的 ID 时：

- "Guten Tag!" 替换 "Bonjour!"
- "Auf Wiedersehen!" 替换 "Au revoir!"

所以，通过提供这个 ID，我们给了每个数据部件一个稳定的身份；当我们写入一个已存在的 ID 时，我们是在更新那个数据部件的值，而不是创建一个新的。

这是为需要随时间更新的数据部件建模的一种非常优雅的方式。非常、非常酷。干得漂亮，我们下一课见。
