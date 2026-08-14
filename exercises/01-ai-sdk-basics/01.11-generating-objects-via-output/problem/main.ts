import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { z } from 'zod';

const model = google('gemini-2.5-flash');

const stream = streamText({
  model,
  prompt: '给我写一个关于假想星球的故事的第一段。',
});

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}

const finalText = await stream.text;

// TODO:将其替换为对 generateText 的调用,传入:
// - model,与上面相同
// - prompt,询问关于假想星球的事实,
//   并将 finalText 作为故事传入
// - output,应该是 Output.object({}),传入
//   schema: z.object({
//     facts: z.array(z.string()).describe('关于这个假想星球的事实。以科学家的口吻来写。'),
//   })
const factsResult = TODO;

// TODO:打印结果的输出
console.log(factsResult.output);
