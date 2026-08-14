import { useChat } from '@ai-sdk/react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertCircle } from 'lucide-react';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';

const App = () => {
  // TODO:从 useChat hook 解构出 error 属性
  const { messages, sendMessage } = useChat({});

  const [input, setInput] = useState(
    `法国的首都是哪里?`,
  );

  return (
    <Wrapper>
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          parts={message.parts}
        />
      ))}
      {/* TODO:如果存在错误,显示错误消息 */}
      {TODO}
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

const ErrorMessage = ({ error }: { error: Error }) => {
  return (
    <div className="flex items-center gap-2 p-3 mb-4 text-red-300 bg-red-900/20 border border-red-500/30 rounded-lg">
      <AlertCircle className="size-5 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
