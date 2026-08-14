import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const model = google('gemini-2.5-flash-lite');

const prompt = '法国的首都是哪里?';

const result = await generateText({
  model,
  prompt,
});

console.log(result.text);
