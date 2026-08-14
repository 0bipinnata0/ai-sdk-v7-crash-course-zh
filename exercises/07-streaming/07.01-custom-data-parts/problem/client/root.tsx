import { useChat } from '@ai-sdk/react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';
import type { MyMessage } from '../api/chat.ts';

const App = () => {
  const { messages, sendMessage } = useChat<MyMessage>({});

  const [input, setInput] = useState(``);

  // TODO:从最后一条消息中获取 data-suggestion 部件
  const latestSuggestion: string | undefined = TODO;

  return (
    <Wrapper>
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          parts={message.parts}
        />
      ))}
      <ChatInput
        // 注意:我们把建议传给 ChatInput 组件,
        // 在那里它会显示为一个按钮
        suggestion={
          messages.length === 0
            ? '法国的首都是哪里?'
            : latestSuggestion
        }
        input={input}
        onChange={(text) => setInput(text)}
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
