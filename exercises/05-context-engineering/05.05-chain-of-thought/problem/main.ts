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

// TODO:添加一些指令,告诉模型在回应之前先思考它的答案。考虑让用户理解代码的最优路径,包括每一段单独的语法。
// TODO:添加一个输出格式,告诉模型返回两个部分——一个 <thinking> 块和一个答案。答案不应该包裹在 <answer> 标签中。
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
