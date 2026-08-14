import { useChat } from '@ai-sdk/react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatInput, Message, Wrapper } from './components.tsx';
import './tailwind.css';

const App = () => {
  const { messages, sendMessage } = useChat({});

  const [input, setInput] = useState(
    '你能描述一下这张图片吗?',
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(
    null,
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
      <ChatInput
        input={input}
        onInputChange={(e) => setInput(e.target.value)}
        onFileSelect={(file) => setSelectedFile(file)}
        selectedFile={selectedFile}
        onSubmit={async (e) => {
          e.preventDefault();

          const formData = new FormData(
            e.target as HTMLFormElement,
          );
          const file = formData.get('file') as File | null;

          // TODO:想办法把文件
          // _连同文本一起_传给
          // /api/chat 路由!

          // 注意:下面有一个好用的函数
          // 叫 fileToDataURL,你可以用它
          // 把文件转换为 data URL。
          // 这会很有用!

          // 注意:确保处理好
          // `file` 为 null 的情况!
          sendMessage({
            // 注意:'parts' 会很有用
            text: input,
          });

          setInput('');
          setSelectedFile(null);
        }}
      />
    </Wrapper>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

/**
 * 将文件转换为 data URL。
 *
 * @param {File} file - 要转换的文件。
 * @returns {Promise<string>} - data URL。
 */
const fileToDataURL = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
