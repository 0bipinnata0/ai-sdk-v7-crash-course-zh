import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const model = openai.chat('gpt-5.5');

const stream = streamText({
  model,
  prompt: '给我写一首关于一只叫 Steven 的猫的十四行诗。',
});

for await (const chunk of stream.toUIMessageStream()) {
  console.log(chunk);
}
