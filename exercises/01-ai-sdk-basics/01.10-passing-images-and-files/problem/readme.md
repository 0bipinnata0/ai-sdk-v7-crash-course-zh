许多语言模型可以处理的不仅仅是文本——它们还能分析图像、PDF 和其他文件。[AI SDK](https://ai-sdk.dev/docs/introduction) 为向你的 LLM 提供商 API 发送文件提供了内置支持。

现在，你的聊天应用前端有一个文件上传按钮，但它实际上没有对文件做任何处理。后端只接收文本消息，所以上传图片是行不通的。

你需要修改表单提交处理器，捕获上传的文件，并将它与用户的文本消息一起发送给 LLM。

## 完成步骤

### 将文件转换为 Data URL

- [ ] 查看代码中已经提供的 `fileToDataURL` 辅助函数

这个函数将表单中的 `File` 对象转换为 [AI SDK](https://ai-sdk.dev/docs/introduction) 可以通过网络发送的字符串。

```ts
const fileToDataURL = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

### 更新表单提交处理器

- [ ] 修改 `ChatInput` 组件中的 `onSubmit` 回调

不要只把 `text` 传给 `sendMessage()`，你需要传一个 `parts` 数组，其中同时包含文本部分和可选的文件部分。

```ts
onSubmit={async (e) => {
  e.preventDefault();

  const formData = new FormData(
    e.target as HTMLFormElement,
  );
  const file = formData.get('file') as File | null;

  // TODO:想办法把文件
  // _连同文本一起_传给
  // /api/chat 路由!

  // 注意:下面有一个好用的函数
  // 叫 fileToDataURL,你可以用它
  // 把文件转换为 data URL。
  // 这会很有用!

  // 注意:确保处理好
  // `file` 为 null 的情况!
  sendMessage({
    // 注意:'parts' 会很有用
    text: input,
  });

  setInput('');
  setSelectedFile(null);
}}
```

查看[消息部件文档](https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message)，了解你需要创建的结构。

### 处理可选的文件部分

- [ ] 仅在文件存在时创建文件部分对象

使用 `fileToDataURL` 函数将文件转换为 data URL 字符串。包含文件的 `mediaType` 属性，让 LLM 知道这是什么类型的文件。

- [ ] 更新 `sendMessage()` 调用，改用 `parts` 数组

`parts` 数组应始终包含一个带有用户输入的文本部分。如果选择了文件，也要在数组中添加一个文件部分。

查看解答代码，看看 `FileUIPart` 类型长什么样。

### 测试你的实现

- [ ] 用 `pnpm run dev` 运行开发服务器

在浏览器中打开 http://localhost:3000。

- [ ] 点击上传文件按钮，从 problem 文件夹中选择 `image.png` 文件

这是一张斯洛文尼亚布莱德湖的图片。

- [ ] 在聊天输入框中输入“你能描述一下这张图片吗?”

- [ ] 提交表单，检查 LLM 是否成功分析了图片

模型应该描述它在图片中看到的内容，而不是静默失败。

- [ ] 确保你使用的模型支持图像分析

[GPT-5.5](https://ai.google.dev/gemini-api/docs/models) 内置了这个能力。
