import { openai } from '@ai-sdk/openai';
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

const result = streamText({
  model: openai.chat('gpt-5.5'),
  prompt: `
    <task-context>
    你是一个乐于助人的助手,负责总结 URL 的内容。
    </task-context>

    <background-data>
    这是网站的内容:
    <url>
    ${url}
    </url>
    <content>
    ${rawContent}
    </content>
    </background-data>

    <rules>
    - 使用网站的内容来回答问题。
    - 如果问题与网站内容无关,说“抱歉,我只能回答关于网站内容的问题。”
    - 使用网站内容中的引文来回答问题。
    - 在输出中使用段落。
    </rules>

    <conversation-history>
    ${input}
    </conversation-history>

    <the-ask>
    根据对话历史总结网站的内容。
    </the-ask>

    <output-format>
    只返回摘要。
    </output-format>
  `,
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
