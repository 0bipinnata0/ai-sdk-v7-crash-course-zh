import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { tavily } from '@tavily/core';

const testCases = [
  {
    input: 'Guillermo Rauch 对 Matt Pocock 的评价是什么?',
    url: 'https://www.aihero.dev/',
  },

  {
    input: 'Matt Pocock 的开源背景是什么?',
    url: 'https://www.aihero.dev/',
  },

  {
    input: '为什么学习 TypeScript 很重要?',
    url: 'https://totaltypescript.com/',
  },
] as const;

// 修改这个值来尝试不同的测试用例
const TEST_CASE_TO_TRY = 0;

const { input, url } = testCases[TEST_CASE_TO_TRY];

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

const scrapeResult = await tavilyClient.extract([url]);

const rawContent = scrapeResult.results[0]?.rawContent;

if (!rawContent) {
  throw new Error('无法抓取该 URL');
}

// TODO:添加背景数据和对话历史
// TODO:添加一些规则,告诉模型在输出中使用段落,并引用网站内容中的引文来回答问题。
// TODO:添加输出格式,告诉模型只返回摘要,不要任何其他文本。
const result = await streamText({
  model: google('gemini-2.5-flash-lite'),
  prompt: `
    <task-context>
    你是一个乐于助人的助手,负责总结 URL 的内容。
    </task-context>

    <the-ask>
    根据对话历史总结网站的内容。
    </the-ask>
  `,
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
