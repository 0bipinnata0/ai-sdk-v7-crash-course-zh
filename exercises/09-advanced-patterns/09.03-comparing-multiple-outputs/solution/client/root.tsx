import { useChat } from '@ai-sdk/react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';
import type { MyMessage } from '../api/chat.ts';

const App = () => {
  const { messages, sendMessage, setMessages } =
    useChat<MyMessage>({});

  const [input, setInput] = useState(
    `“strawberry” 这个单词里有几个字母 R?`,
  );

  const latestMessage = messages[messages.length - 1];

  const latestMessageIsAwaitingResponse =
    latestMessage?.role === 'assistant' &&
    latestMessage.parts.some(
      (part) => part.type === 'data-output',
    );

  return (
    <Wrapper>
      {messages.map((message, index) => (
        <Message
          key={message.id}
          role={message.role}
          parts={message.parts}
          onSelectModel={(partId) => {
            const part = message.parts
              .filter((part) => part.type === 'data-output')
              .find((part) => part.id === partId);

            if (!part) {
              return;
            }

            const newMessages = messages.slice(0, index);
            newMessages.push({
              ...message,
              parts: [
                {
                  type: 'text',
                  text: part.data.text,
                },
              ],
            });
            setMessages(newMessages);
          }}
        />
      ))}
      <ChatInput
        placeholder={
          latestMessageIsAwaitingResponse
            ? '请选择一个回复以继续...'
            : '说点什么...'
        }
        input={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({
            text: input,
          });
          setInput('');
        }}
        disabled={latestMessageIsAwaitingResponse}
      />
    </Wrapper>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
