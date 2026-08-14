import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { evalite } from 'evalite';

evalite('Capitals', {
  data: () => [
    {
      input: '法国的首都是哪里?',
      expected: '巴黎',
    },
    {
      input: '德国的首都是哪里?',
      expected: '柏林',
    },
    {
      input: '意大利的首都是哪里?',
      expected: '罗马',
    },
  ],
  task: async (input) => {
    const capitalResult = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt: `
        你是一个乐于助人的助手,可以回答关于国家首都的问题。

        <question>
        ${input}
        </question>

        回答问题。
        只回复国家的首都。
      `,
    });

    return capitalResult.text;
  },
  scorers: [
    {
      name: 'includes',
      scorer: ({ input, output, expected }) => {
        return output.includes(expected!) ? 1 : 0;
      },
    },
  ],
});
