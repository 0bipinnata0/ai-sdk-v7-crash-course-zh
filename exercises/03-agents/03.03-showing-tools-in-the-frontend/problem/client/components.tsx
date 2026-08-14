import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { UIMessage } from 'ai';

export const Wrapper = (props: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {props.children}
    </div>
  );
};

export const Message = ({
  role,
  parts,
}: {
  role: string;
  // TODO - 把 UIMessage 类型替换为 MyUIMessage
  parts: UIMessage['parts'];
}) => {
  const prefix = role === 'user' ? '用户: ' : 'AI: ';

  const text = parts
    .map((part) => {
      if (part.type === 'text') {
        return part.text;
      }
      return '';
    })
    .join('');
  return (
    <div className="flex flex-col gap-2">
      <div className="prose prose-invert my-6">
        <ReactMarkdown>{prefix + text}</ReactMarkdown>
      </div>
      {parts.map((part, index) => {
        if (part.type === 'tool-writeFile') {
          // TODO - 返回一个展示 tool-writeFile 工具调用的
          // JSX 元素
          // 参照下面其他工具调用的模式
          // 注意它给你提供了工具的自动补全!
          return TODO;
        }
        if (part.type === 'tool-readFile') {
          return (
            <div
              key={index}
              className="bg-green-900/20 border border-green-700 rounded p-3 text-sm"
            >
              <div className="font-semibold text-green-300 mb-1">
                📖 读取文件
              </div>
              <div className="text-green-200">
                路径:{part.input?.path || '未知'}
              </div>
            </div>
          );
        }
        if (part.type === 'tool-deletePath') {
          return (
            <div
              key={index}
              className="bg-red-900/20 border border-red-700 rounded p-3 text-sm"
            >
              <div className="font-semibold text-red-300 mb-1">
                🗑️ 删除了路径
              </div>
              <div className="text-red-200">
                路径:{part.input?.path || '未知'}
              </div>
            </div>
          );
        }
        if (part.type === 'tool-listDirectory') {
          return (
            <div
              key={index}
              className="bg-yellow-900/20 border border-yellow-700 rounded p-3 text-sm"
            >
              <div className="font-semibold text-yellow-300 mb-1">
                📁 列出了目录
              </div>
              <div className="text-yellow-200">
                路径:{part.input?.path || '未知'}
              </div>
            </div>
          );
        }
        if (part.type === 'tool-createDirectory') {
          return (
            <div
              key={index}
              className="bg-purple-900/20 border border-purple-700 rounded p-3 text-sm"
            >
              <div className="font-semibold text-purple-300 mb-1">
                📂 创建了目录
              </div>
              <div className="text-purple-200">
                路径:{part.input?.path || '未知'}
              </div>
            </div>
          );
        }
        if (part.type === 'tool-exists') {
          return (
            <div
              key={index}
              className="bg-cyan-900/20 border border-cyan-700 rounded p-3 text-sm"
            >
              <div className="font-semibold text-cyan-300 mb-1">
                🔍 检查了是否存在
              </div>
              <div className="text-cyan-200">
                路径:{part.input?.path || '未知'}
              </div>
            </div>
          );
        }
        if (part.type === 'tool-searchFiles') {
          return (
            <div
              key={index}
              className="bg-orange-900/20 border border-orange-700 rounded p-3 text-sm"
            >
              <div className="font-semibold text-orange-300 mb-1">
                🔎 搜索了文件
              </div>
              <div className="text-orange-200">
                模式:{part.input?.pattern || '未知'}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

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
