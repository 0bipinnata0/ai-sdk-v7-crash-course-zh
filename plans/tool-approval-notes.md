# 工具审批课程(智能体章节末尾)

**格式:problem-solution**
**设置:客户端-服务器,前端已部分构建**

## 场景
用户想在发送邮件前预览邮件。批准或拒绝发送。

## 后端:工具上的 needsApproval

```ts
import { tool } from 'ai';
import { z } from 'zod';

export const sendEmailTool = tool({
  description: 'Send an email',
  inputSchema: z.object({
    to: z.string(),
    subject: z.string(),
    body: z.string(),
  }),
  needsApproval: true, // 需要用户批准
  execute: async ({ to, subject, body }) => {
    // 发送邮件逻辑
    return { sent: true };
  },
});
```

## 前端:审批 UI 组件

```tsx
export function EmailToolView({ invocation, addToolApprovalResponse }) {
  if (invocation.state === 'approval-requested') {
    return (
      <div>
        <p>Send this email?</p>
        <p>To: {invocation.input.to}</p>
        <p>Subject: {invocation.input.subject}</p>
        <p>{invocation.input.body}</p>
        <button
          onClick={() =>
            addToolApprovalResponse({
              id: invocation.approval.id,
              approved: true,
            })
          }
        >
          Send
        </button>
        <button
          onClick={() =>
            addToolApprovalResponse({
              id: invocation.approval.id,
              approved: false,
            })
          }
        >
          Cancel
        </button>
      </div>
    );
  }

  if (invocation.state === 'output-available') {
    return <div>Email sent!</div>;
  }
}
```

## useChat hook 设置

```ts
import { useChat } from '@ai-sdk/react';
import { lastAssistantMessageIsCompleteWithApprovalResponses } from 'ai';

const { messages, addToolApprovalResponse } = useChat({
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
});
```

## 练习设置
- 前端组件已部分构建(显示邮件预览)
- 用户需要:
  1. 给工具添加 `needsApproval: true`
  2. 从 useChat 接上 `addToolApprovalResponse`
  3. 连接批准/拒绝按钮

## 待解决问题
- 拒绝原因什么时候传入?(需要研究 API)
