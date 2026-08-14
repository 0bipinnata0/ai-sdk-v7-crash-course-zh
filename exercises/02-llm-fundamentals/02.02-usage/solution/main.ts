import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const output = streamText({
  model: openai.chat('gpt-5.5'),
  prompt: `哪个国家做的香肠最好?用一个段落回答。`,
});

for await (const chunk of output.textStream) {
  process.stdout.write(chunk);
}

console.log(); // 打印一个空行,把输出和用量信息隔开
console.log(await output.usage);
