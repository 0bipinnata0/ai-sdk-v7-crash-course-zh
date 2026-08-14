import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { MyUIMessage } from '../api/chat.ts';

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
}: // TODO:添加 addToolApprovalResponse 属性,一个接受以下参数的函数:
// - id: string
// - approved: boolean
{
  role: string;
  parts: MyUIMessage['parts'];
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
        if (part.type === 'tool-sendEmail') {
          // TODO:检查 part.state === 'approval-requested'
          // 如果是,渲染邮件预览和批准/拒绝按钮
          // 使用 addToolApprovalResponse({ id: part.approval.id, approved: true/false })

          if (part.state === 'output-available') {
            return (
              <div
                key={index}
                className="bg-green-900/20 border border-green-700 rounded p-3 text-sm"
              >
                <div className="font-semibold text-green-300 mb-1">
                  邮件已发送
                </div>
                <div className="text-green-200">
                  收件人:{part.input.to}
                </div>
              </div>
            );
          }
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
