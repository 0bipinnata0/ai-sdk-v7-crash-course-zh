import { useChat } from '@ai-sdk/react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';
import type { MyMessage } from '../api/chat.ts';

const App = () => {
  const { messages, sendMessage } = useChat<MyMessage>({});

  const [input, setInput] = useState(
    `“strawberry” 这个单词里有几个字母 R?`,
  );

  const latestMessage = messages[messages.length - 1];

  // 注意:这检查最新消息是否正在等待
  // 响应。如果是,我们要禁用输入框。
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

            // TODO:onSelectModel 的目标是把两个
            // data-output 部件替换为单个文本部件——
            // 即我们选为最佳的那个输出。

            // TODO:这意味着我们需要更新 useChat 中的消息,
            // 用一个带有单个文本部件的新消息
            // 替换当前这条消息。

            // TODO:使用 messages.slice 取出当前消息
            // 之前的所有消息。
            const newMessages = TODO;

            // TODO:向 newMessages 数组推入一条新消息,
            // 它是当前消息的副本,但 data-output 部件
            // 被替换为了一个文本部件。
            newMessages.push(TODO);

            // TODO:把新消息数组设置为 useChat 中的消息
            // (useChat 返回一个 setMessages 函数)
            TODO;
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
