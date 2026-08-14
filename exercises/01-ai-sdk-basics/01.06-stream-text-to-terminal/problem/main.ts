import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const model = openai.chat('gpt-5.5');

const prompt = '给我写一个关于假想星球的故事的第一段。';

const stream = streamText({model,prompt}); // TODO - 用上面的模型流式输出一些文本。

for await (const chunk of stream.textStream) {
  process.stdout.write(chunk);
}
