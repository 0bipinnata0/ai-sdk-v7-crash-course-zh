import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const INPUT = `帮我调研一下电磁灶,以及我该如何把一台 100cm 宽的 AGA 炉灶换成电磁集成灶。哪款最便宜,哪款最好?`;

// 注意:好的输出应该是:“电磁灶 vs AGA 炉灶”

const result = streamText({
  model: openai.chat('gpt-5.5'),
  // TODO:使用上一个练习中的 Anthropic 模板
  // 重写这个提示词。
  // 你不需要模板中的所有部分。
  prompt: `
    给我生成一个标题:
    ${INPUT}
  `,
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
