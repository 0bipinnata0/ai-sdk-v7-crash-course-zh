import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

const model = google('gemini-2.5-flash');

const stream = streamText({
  model,
  prompt: '给我写一个关于假想星球的故事的第一段。',
});

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
