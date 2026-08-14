import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

const model = google('gemini-2.5-flash');

const stream = streamText({
  model,
  prompt: '给我写一首关于一只叫 Steven 的猫的十四行诗。',
});

for await (const chunk of stream.toUIMessageStream()) {
  console.log(chunk);
}
