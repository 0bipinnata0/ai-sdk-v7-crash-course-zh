import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const model = openai.chat('gpt-5.5');

const stream = streamText({
  model,
  prompt: '给我写一个关于假想星球的故事的第一段。',
});

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
