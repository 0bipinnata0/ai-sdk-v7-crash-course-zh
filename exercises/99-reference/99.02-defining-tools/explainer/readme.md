下面是一个如何使用 AI SDK 定义工具的示例。

我们在一个 `streamText` 调用内部，提示词是：把消息 "hello world" 打印到控制台：

```ts
const result = streamText({
  model: google('gemini-2.5-flash'),
  prompt: '把消息“你好,世界!”打印到控制台',
  tools: {
    // ...下面解释
  },
});
```

当然，LLM 本身无法做到这一点，所以我们给了它一个叫做 `logToConsole` 的工具，它可以用这个工具来执行那个任务。

## `tool` 函数

这个工具接收一段对自身的描述（会传给 LLM)，然后是一个 `inputSchema`（也会传给 LLM)，用来描述它应该用什么参数调用这个工具。我们使用 Zod 来描述输入 schema。

在底层，它会被转换为 JSON schema，然后传给 LLM。但它也在内部用于校验我们从 LLM 收到的东西。所以这意味着 LLM 实际上不能用出乎意料的参数来调用我们的工具，因为 Zod 会校验。

```ts
tools: {
  logToConsole: tool({
    description: '把一条消息打印到控制台',
    inputSchema: z.object({
      message: z
        .string()
        .describe('要打印到控制台的消息'),
    }),
    // execute 函数写在这里
  }),
}
```

在这个例子中，schema 是一个带有字符串类型 `message` 属性的对象，它被描述为"要打印到控制台的消息"。

这个 `.describe` 调用非常方便，尤其是当你的对象有很多属性的时候。而且就像和 LLM 相关的其他一切一样，这里也是一个做提示词工程的机会。

当然，你可以像这里一样内联声明 `tools` 对象，也可以把它移到一个单独的文件中。它就是一段普通的代码。

## `execute` 函数

我们的 `execute` 函数是工具真正执行的地方。当然，LLM 不会替我们执行代码，它告诉我们它想执行什么代码，然后由我们在自己的进程中执行这些代码。

```ts
execute: async ({ message }) => {
  console.log(styleText(['green', 'bold'], message));

  return '消息已打印到控制台';
};
```

在这个例子中，我们将把带样式的（绿色加粗）消息打印到控制台。我们从 `execute` 函数返回的任何东西，都会作为这次函数调用的结果报告传回给 LLM。

所以这意味着：LLM 可以用这个 `z.string()` 消息调用一个工具，把参数交给我们这里的函数执行，我们执行后告诉 LLM 发生了什么。

## 流式输出结果

在底部这里，我们遍历 `result.toUIMessageStream()` 的每个 chunk，所以我们应该能看到流中的所有块：

```ts
for await (const chunk of result.toUIMessageStream()) {
  console.log(chunk);
}
```

当我们运行这个时，最终会得到一个 start，然后是一个 start step——表示一步开始了。然后是工具输入，和其他东西一样，工具输入实际上也是从 LLM 流式传输的。所以我们有一个 tool-input-start，然后是一个 tool-input-delta，即实际的消息内容。

然后我们可以看到它以这里的"你好，世界！"被执行了。接着出现另一个部件叫 tool-input-available，然后是 tool-output-available，这是我们传回给 LLM 的消息。在这个例子中，它结束了这一步，然后结束了输出。

```txt
{ type: 'start' }
{ type: 'start-step' }
{
  type: 'tool-input-start',
  toolCallId: 'B1iGVK2Sa3b0JRzJ',
  toolName: 'logToConsole',
  dynamic: false
}
{
  type: 'tool-input-delta',
  toolCallId: 'B1iGVK2Sa3b0JRzJ',
  inputTextDelta: '{"message":"你好,世界!"}'
}
你好,世界!
{
  type: 'tool-input-available',
  toolCallId: 'B1iGVK2Sa3b0JRzJ',
  toolName: 'logToConsole',
  input: { message: '你好,世界!' }
}
{
  type: 'tool-output-available',
  toolCallId: 'B1iGVK2Sa3b0JRzJ',
  output: '消息已打印到控制台'
}
{ type: 'finish-step' }
{ type: 'finish' }
```

希望这能让你对如何声明这些工具有个不错的理解。干得漂亮，我们下一课见。

## 完成步骤

- [ ] 试着运行我们的 [`main.ts`](./main.ts) 练习代码，看看会发生什么。

- [ ] 试着把提示词改成别的，或者试验不同的工具。要不要试试 `writeFile` 工具？
