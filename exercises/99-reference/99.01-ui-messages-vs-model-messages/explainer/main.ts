import {
  convertToModelMessages,
  type ModelMessage,
  type UIMessage,
} from 'ai';

const messages: UIMessage[] = [
  {
    role: 'user',
    id: '1',
    parts: [
      {
        type: 'text',
        text: '法国的首都是哪里?',
      },
    ],
  },
  {
    role: 'assistant',
    id: '2',
    parts: [
      {
        type: 'text',
        text: '法国的首都是巴黎。',
      },
    ],
  },
];

const main = async () => {
  const modelMessages = await convertToModelMessages(messages);
  console.dir(modelMessages, { depth: null });
};

main();
