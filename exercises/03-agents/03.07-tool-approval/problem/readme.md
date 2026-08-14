构建 AI 智能体时存在一个根本的矛盾：你赋予它们的权力越大，它们就越有用，但它们犯下代价高昂的错误的可能性也越大。像发送邮件这样的破坏性操作是无法撤销的。

解决方案是人在回路（human-in-the-loop）审批。在 LLM 执行有风险的操作之前，先征求你的许可。幸运的是，[AI SDK](https://ai-sdk.dev/docs/introduction) 内置了对这种模式的支持，所以你不需要从头实现。

在本练习中，你将为一个 `sendEmail` 工具添加审批工作流，创建一个让用户在邮件发送前可以审查和批准的 UI。

## 完成步骤

### 设置后端

- [ ] 在 `api/chat.ts` 中给 `sendEmail` 工具定义添加 `needsApproval: true`

这告诉 AI SDK，这个工具在执行前需要用户批准。

```ts
const tools = {
  sendEmail: tool({
    description: '给收件人发送一封邮件',
    inputSchema: z.object({
      to: z
        .string()
        .describe('收件人的邮箱地址'),
      subject: z.string().describe('邮件的主题'),
      body: z.string().describe('邮件的正文'),
    }),
    needsApproval: true,
    // TODO:添加 needsApproval: true,在发送前要求用户批准
    execute: async ({ to, subject, body }) => {
      // 在真实应用中,这里会发送邮件
      console.log(`正在发送邮件给 ${to}:${subject}`);
      return { sent: true, to, subject };
    },
  }),
};
```

### 构建前端 UI

- [ ] 在 `client/components.tsx` 中给 `Message` 组件添加 `addToolApprovalResponse` 属性

这个属性是一个函数，接受一个 `id`（字符串）和 `approved`（布尔值）。

```ts
export const Message = ({
  role,
  parts,
}: // TODO:添加 addToolApprovalResponse 属性,一个接受以下参数的函数:
// - id: string
// - approved: boolean
{
  role: string;
  parts: MyUIMessage['parts'];
})
```

- [ ] 当 `part.state === 'approval-requested'` 时渲染审批 UI

检查 `approval-requested` 状态，显示邮件详情（收件人、主题、正文）以及批准和拒绝按钮。

```ts
if (part.type === 'tool-sendEmail') {
  // TODO:检查 part.state === 'approval-requested'
  // 如果是,渲染邮件预览和批准/拒绝按钮
  // 使用 addToolApprovalResponse({ id: part.approval.id, approved: true/false })
```

当用户点击批准时，调用 `addToolApprovalResponse({ id: part.approval.id, approved: true })`。当他们点击拒绝时，使用 `approved: false`。

### 连接父组件

- [ ] 在 `client/root.tsx` 中从 [`useChat`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) 获取 `addToolApprovalResponse`

[`useChat`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) hook 会直接返回这个函数。

```ts
const { messages, sendMessage, addToolApprovalResponse } =
  useChat<MyUIMessage>({
    // TODO:从 useChat 获取 addToolApprovalResponse
    // TODO:使用 lastAssistantMessageIsCompleteWithApprovalResponses
    // 添加 sendAutomaticallyWhen 选项
  });
```

- [ ] 把 `addToolApprovalResponse` 传给 `Message` 组件

```ts
{messages.map((message) => (
  <Message
    key={message.id}
    role={message.role}
    parts={message.parts}
    // TODO:把 addToolApprovalResponse 传给 Message
  />
))}
```

- [ ] 给 [`useChat`](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) 添加 `sendAutomaticallyWhen` 选项

从 [AI SDK](https://ai-sdk.dev/docs/introduction) 导入 [`lastAssistantMessageIsCompleteWithApprovalResponses`](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage) 并传给 hook。这会在所有审批处理完毕后自动发送响应。

```ts
import { lastAssistantMessageIsCompleteWithApprovalResponses } from 'ai';

const { messages, sendMessage, addToolApprovalResponse } =
  useChat<MyUIMessage>({
    sendAutomaticallyWhen:
      lastAssistantMessageIsCompleteWithApprovalResponses,
  });
```

### 测试你的实现

- [ ] 用 `pnpm run dev` 运行开发服务器

- [ ] 发送消息："给 bob@example.com 发一封邮件，说声你好"

LLM 应该调用 `sendEmail` 工具并显示你的审批 UI。

- [ ] 测试批准按钮

点击批准并检查你的浏览器控制台。你应该能看到 `正在发送邮件给 bob@example.com:你好`。

- [ ] 测试拒绝按钮

拒绝一封邮件，验证 LLM 会询问后续信息而不是直接发送。
