import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';
import type { MyMessage } from '../api/chat.ts';

const App = () => {
  const { messages, sendMessage } = useChat<MyMessage>({});

  const [input, setInput] = useState(``);

  // TODO:更新这里以处理新的
  // data-suggestions 部件
  const latestSuggestion = messages[
    messages.length - 1
  ]?.parts.find((part) => part.type === 'data-suggestion')?.data;

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
        // TODO:更新这里以处理新的
        // data-suggestions 部件
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
