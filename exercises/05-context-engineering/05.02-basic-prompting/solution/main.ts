import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

const INPUT = `帮我调研一下电磁灶,以及我该如何把一台 100cm 宽的 AGA 炉灶换成电磁集成灶。哪款最便宜,哪款最好?`;

const result = streamText({
  model: google('gemini-2.5-flash-lite'),
  prompt: `
    <task-context>
    你是一个乐于助人的助手,可以为对话生成标题。
    </task-context>

    <conversation-history>
    ${INPUT}
    </conversation-history>

    <rules>
    找到能抓住对话精髓的最简洁标题。
    标题最多 30 个字符。
    标题使用句子式大小写,每个单词首字母大写。结尾不要句号。
    </rules>

    <the-ask>
    为这段对话生成一个标题。
    </the-ask>

    <output-format>
    只返回标题。
    </output-format>
  `,
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
