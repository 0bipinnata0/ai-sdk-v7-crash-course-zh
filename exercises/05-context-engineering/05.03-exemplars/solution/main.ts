import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const INPUT = `帮我调研一下电磁灶,以及我该如何把一台 100cm 宽的 AGA 炉灶换成电磁集成灶。哪款最便宜,哪款最好?`;

const exemplars = [
  {
    input: `TypeScript 和 JavaScript 有什么区别?我应该先学 TypeScript 还是 JavaScript?`,
    expected: 'TypeScript 与 JavaScript 对比',
  },
  {
    input: `我想开始投资,但完全是新手。对于一个有 5000 元可投资的人来说,最安全的选择是什么?`,
    expected: '新手投资选择',
  },
];

const result = streamText({
  model: openai.chat('gpt-5.5'),
  prompt: `
    <examples>
      ${exemplars
        .map(
          (e) =>
            `
          <example>
            <input>${e.input}</input>
            <expected>${e.expected}</expected>
          </example>
          `,
        )
        .join('\n')}
    </examples>

    <conversation-history>
    ${INPUT}
    </conversation-history>

    <the-ask>
    为这段对话生成一个标题。
    </the-ask>
  `,
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
