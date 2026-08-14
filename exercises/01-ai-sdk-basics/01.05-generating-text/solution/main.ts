import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const model = openai.chat('gpt-5.5');

const prompt = '法国的首都是哪里?';

const result = await generateText({
  model,
  prompt,
});

console.log(result.text);
