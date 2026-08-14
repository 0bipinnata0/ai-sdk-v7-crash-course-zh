import { google } from '@ai-sdk/google';
import { generateText, Output, streamText } from 'ai';
import z from 'zod';

const model = google('gemini-2.5-flash');

const stream = streamText({
  model,
  prompt: '给我写一个关于假想星球的故事的第一段。',
});

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}

const finalText = await stream.text;

// TODO:将 generateText 替换为 streamText,保留 01.10 中
// 带有 facts schema 的同一个 Output.object
// 然后使用 partialOutputStream 遍历流式块
const factsResult = await generateText({
  model,
  prompt: `给我一些关于这个假想星球的事实。这是故事:${finalText}`,
  output: Output.object({
    schema: z.object({
      facts: z
        .array(z.string())
        .describe(
          '关于这个假想星球的事实。以科学家的口吻来写。',
        ),
    }),
  }),
});

// TODO:将其替换为对 factsResult.partialOutputStream 的 for-await 循环
// 打印每个到达的部分对象
console.log(factsResult.output);
