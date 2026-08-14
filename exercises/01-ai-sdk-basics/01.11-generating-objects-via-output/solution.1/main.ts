import { openai } from '@ai-sdk/openai';
import { generateText, Output, streamText } from 'ai';
import { z } from 'zod';

const model = openai.chat('gpt-5.5');

const stream = streamText({
  model,
  prompt: '给我写一个关于假想星球的故事的第一段。',
});

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}

const finalText = await stream.text;

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

console.log(factsResult.output);
