import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { evalite } from 'evalite';
import { readFileSync } from 'fs';
import path from 'path';
import { z } from 'zod';
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
      model: openai.chat('gpt-5.5'),
      instructions: `
        你是一个乐于助人的助手,可以回答关于思维链提示论文的问题。
        
        回答问题时务必引用论文中的原文。
      `,
      messages: [
        {
          role: 'user',

          content: [
            {
              type: 'text',
              text: input,
            },
            {
              type: 'file',
              data: chainOfThoughtPaper,
              mediaType: 'application/pdf',
            },
          ]
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
