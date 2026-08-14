import { google } from '@ai-sdk/google';
import { streamObject, streamText } from 'ai';
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

// 旧方式:直接使用 streamObject,而不是 streamText + Output.object
const factsResult = streamObject({
  model,
  prompt: `给我一些关于这个假想星球的事实。这是故事:${finalText}`,
  schema: z.object({
    facts: z
      .array(z.string())
      .describe(
        '关于这个假想星球的事实。以科学家的口吻来写。',
      ),
  }),
});

for await (const chunk of factsResult.partialObjectStream) {
  console.log(chunk);
}
