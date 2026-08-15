import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';
import type { MyUIMessage } from '../api/chat.ts';

const App = () => {
  // TODO:从 useChat 获取 addToolApprovalResponse
  // TODO:使用 lastAssistantMessageIsCompleteWithApprovalResponses 添加 sendAutomaticallyWhen 选项
  const { messages, sendMessage } = useChat<MyUIMessage>({});

  const [input, setInput] = useState(
    '给 bob@example.com 发一封邮件,说声你好',
  );

  return (
    <Wrapper>
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          parts={message.parts}
          // TODO:把 addToolApprovalResponse 传给 Message
        />
      ))}
      <ChatInput
        input={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({
            text: input,
          });
          setInput('');
        }}
      />
    </Wrapper>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
