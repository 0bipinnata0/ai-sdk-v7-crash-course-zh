import type { UIMessage } from 'ai';
import React from 'react';
import ReactMarkdown from 'react-markdown';

export const Wrapper = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {props.children}
    </div>
  );
};

// TODO:使用这个组件来处理你在
// api/chat.ts 文件中创建的自定义数据部件
export const Message = ({
  role,
  parts,
}: {
  role: string;
  parts: UIMessage['parts'];
}) => (
  <div className="my-4">
    {parts.map((part) => {
      // TODO:使用这个组件来处理你在
      // api/chat.ts 文件中创建的自定义数据部件
      TODO;

      if (part.type === 'text') {
        return (
          <div className="mb-4 text-white">
            <ReactMarkdown>
              {(role === 'user' ? '用户: ' : 'AI: ') + part.text}
            </ReactMarkdown>
          </div>
        );
      }

      return null;
    })}
  </div>
);

export const ChatInput = ({
  input,
  onChange,
  onSubmit,
  disabled,
}: {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}) => (
  <form onSubmit={onSubmit}>
    <input
      className={`fixed bottom-0 w-full max-w-md p-2 mb-8 border-2 border-zinc-700 rounded shadow-xl bg-gray-800 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      value={input}
      placeholder={
        disabled
          ? '请先处理工具调用...'
          : '说点什么...'
      }
      onChange={onChange}
      disabled={disabled}
      autoFocus
    />
  </form>
);
