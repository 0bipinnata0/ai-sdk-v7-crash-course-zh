import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { evalite } from 'evalite';
import { readFileSync } from 'fs';
import path from 'path';
import { attributionToChainOfThoughtPaper } from './attribution-eval.ts';

const chainOfThoughtPaper = readFileSync(
  path.join(
    import.meta.dirname,
    'chain-of-thought-prompting.pdf',
  ),
);

evalite('Chain Of Thought Paper', {
  data: () => [
    {
      input: '什么是思维链提示?',
    },
    {
      input:
        '论文作者为什么认为思维链提示能带来改进?',
    },
  ],
  task: async (input) => {
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      system: `
        你是一个乐于助人的助手,可以回答关于思维链提示论文的问题。
      `,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `
              <question>
              ${input}
              </question>

              回答问题时务必引用论文中的原文。
              `,
            },
            {
              type: 'file',
              data: chainOfThoughtPaper,
              mediaType: 'application/pdf',
            },
          ],
        },
      ],
    });

    return result.text;
  },
  scorers: [
    {
      name: 'Includes Quotes',
      scorer: ({ input, output, expected }) => {
        const quotesFound = output.includes('"');

        return quotesFound ? 1 : 0;
      },
    },
    attributionToChainOfThoughtPaper,
  ],
});
