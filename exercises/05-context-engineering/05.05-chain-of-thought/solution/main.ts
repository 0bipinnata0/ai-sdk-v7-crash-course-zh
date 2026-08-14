import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const COMPLEX_TS_CODE = readFileSync(
  path.join(import.meta.dirname, 'complex-ts-code.ts'),
  'utf-8',
);

const IIMT_ARTICLE = readFileSync(
  path.join(import.meta.dirname, 'iimt-article.md'),
  'utf-8',
);

const result = streamText({
  model: google('gemini-2.5-flash-lite'),
  prompt: `
    <task-context>
    你是一位乐于助人的 TypeScript 专家,能够为 TypeScript 初学者解释复杂的 TypeScript 代码。你会收到一段复杂的 TypeScript 代码,你需要用易于理解的方式来解释它。
    </task-context>

    <background-data>
    这是那段复杂的 TypeScript 代码:
    <code>
    ${COMPLEX_TS_CODE}
    </code>

    还有一篇关于 IIMT 模式的文章:
    <article>
    ${IIMT_ARTICLE}
    </article>
    </background-data>

    <rules>
    - 不要让用户知道你在参考那篇文章。像专家一样谈论这些概念。
    - 使用章节标题来组织解释。
    </rules>

    <the-ask>
    参考这篇文章来解释这段代码。
    </the-ask>

    <thinking-instructions>
      在回应之前,先思考你的答案。考虑让用户理解代码的最优路径。考虑所有的知识依赖——即那些依赖于其他知识的知识点。假设用户对 TypeScript 知之甚少。按依赖顺序列出用户需要了解的知识点清单。
    </thinking-instructions>

    <output-format>
    返回两个部分——一个 <thinking> 块和一个答案。
    - <thinking> 块应该包含你的思考过程,并包裹在 <thinking> 标签中。
    - 答案不应该包裹在标签中。
    - 答案应该使用 markdown 格式,TypeScript 代码用代码块表示。
    </output-format>
  `,
});

console.log('正在生成答案');

for await (const chunk of result.textStream) {
  process.stdout.write('.');
}

const output = await result.text;

const outputPath = path.join(import.meta.dirname, 'output.md');

writeFileSync(outputPath, output);

console.log(`\n答案已写入 ${outputPath}!`);
