import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { evalite } from 'evalite';

const links = [
  {
    title: 'TypeScript 5.8',
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html',
  },
  {
    title: 'TypeScript 5.7',
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html',
  },
  {
    title: 'TypeScript 5.6',
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-6.html',
  },
  {
    title: 'TypeScript 5.5',
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html',
  },
  {
    title: 'TypeScript 5.4',
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html',
  },
  {
    title: 'TypeScript 5.3',
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-3.html',
  },
  {
    title: 'TypeScript 5.2',
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html',
  },
  {
    title: 'TypeScript 5.1',
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-1.html',
  },
  {
    title: 'TypeScript 5.0',
    url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html',
  },
];

evalite('TS Release Notes', {
  data: () => [
    {
      input: '给我讲讲 TypeScript 5.8 版本',
    },
    {
      input: '给我讲讲 TypeScript 5.2 版本',
    },
  ],
  task: async (input) => {
    const capitalResult = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt: `
        你是一个乐于助人的助手,可以回答关于 TypeScript 版本发布的问题。

        <question>
        ${input}
        </question>

        <links>
        ${links.map((link) => `<link>${link.title}: ${link.url}</link>`).join('\n')}
        </links>

        极其简洁地回答问题。
        始终在你的回答中包含相关链接。
        将 markdown 链接内联格式化:
          <markdown-link-example>
          我真的很喜欢[这个关于蛋糕的网站](https://www.cakes.com)。
          </markdown-link-example>
          <markdown-link-example>
          更多信息,请查看[这份参考资料](https://www.cakes.com)。
          </markdown-link-example>

        回答问题,并附上相关链接。
        只回复答案。
      `,
    });

    return capitalResult.text;
  },
  scorers: [
    {
      name: 'Includes Markdown Links',
      scorer: ({ input, output, expected }) => {
        const markdownLinksFound =
          output.match(/\[.*?\]\((.*?)\)/g) ?? [];

        return markdownLinksFound.length > 0 ? 1 : 0;
      },
    },
    {
      name: 'Output length',
      scorer: ({ input, output, expected }) => {
        return output.length < 500 ? 1 : 0;
      },
    },
  ],
});
