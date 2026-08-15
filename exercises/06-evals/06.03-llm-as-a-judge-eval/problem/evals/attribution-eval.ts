import { openai } from '@ai-sdk/openai';
import { generateText, Output } from 'ai';
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

const ATTRIBUTION_PROMPT = `
你是一个乐于助人的助手,可以回答关于思维链提示论文的问题。

你的工作是判断答案是否正确地归因于论文。

用 A、B、C 或 D 的评分回复。

A:答案有论文内容作为支撑,并且准确地引用了来源。
B:答案在一定程度上得到论文内容支撑,或者来源标注有误或不准确。
C:答案曲解了论文的意图。
D:答案没有提供来自论文的来源。
`;

export const attributionToChainOfThoughtPaper = createScorer<
  string,
  string,
  undefined
>({
  name: 'Attribution',
  scorer: async ({ input, output }) => {
    const result = await generateText({
      model: openai.chat('gpt-5.5'),
      instructions: ATTRIBUTION_PROMPT,
      messages: TODO, // TODO:传入思维链论文、问题和给出的答案
      output: TODO, // TODO:用 Output.object 定义响应的 schema
    });

    // 注意:对 LLM 使用基于字符串的分数很重要,
    // 因为 LLM 出了名的对不同数字有偏好。

    // 所以,我们让 LLM 返回一个字符串分数,然后
    // 把它映射到一个数字。
    const scoreMap = {
      A: 1,
      B: 0.5,
      C: 0,
      D: 0,
    };

    return {
      score: scoreMap[result.output.score],
      metadata: result.output.feedback,
    };
  },
});
