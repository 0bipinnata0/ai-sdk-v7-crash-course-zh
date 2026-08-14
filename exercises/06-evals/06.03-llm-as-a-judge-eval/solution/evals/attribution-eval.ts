import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { createScorer } from 'evalite';
import { readFileSync } from 'fs';
import path from 'path';
import { z } from 'zod';

const chainOfThoughtPaper = readFileSync(
  path.join(
    import.meta.dirname,
    'chain-of-thought-prompting.pdf',
  ),
);

export const attributionToChainOfThoughtPaper = createScorer<
  string,
  string,
  undefined
>({
  name: 'Attribution',
  scorer: async ({ input, output, expected }) => {
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      instructions: `
        你是一个乐于助人的助手,可以回答关于思维链提示论文的问题。

        你的工作是判断答案是否正确地归因于论文。

        用 A、B、C 或 D 的评分回复。

        A:答案有论文内容作为支撑,并且准确地引用了来源。
        B:答案在一定程度上得到论文内容支撑,或者来源标注有误或不准确。
        C:答案曲解了论文的意图。
        D:答案没有提供来自论文的来源。
      `,
      messages: [
        {
          role: 'user',

          content: [
            {
              type: 'file',
              data: chainOfThoughtPaper,
              mediaType: 'application/pdf',
            },
            {
              type: 'text',
              text: `你正在评估的答案是:

            ${output}

            最初提出的问题是:

            ${input}`,
            },
          ]
        },
      ],
      schema: z.object({
        feedback: z
          .string()
          .describe(
            '关于答案的简短反馈信息。',
          ),
        score: z.enum(['A', 'B', 'C', 'D']),
      }),
    });

    const scoreMap = {
      A: 1,
      B: 0.5,
      C: 0,
      D: 0,
    };

    return {
      score: scoreMap[result.object.score],
      metadata: result.object.feedback,
    };
  },
});
