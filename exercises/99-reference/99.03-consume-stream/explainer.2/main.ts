import { openai } from '@ai-sdk/openai';
import { consumeStream, streamText } from 'ai';

console.log('进程启动中...');

const streamTextResult = streamText({
  model: openai.chat('gpt-5.5'),
  prompt: '你好,世界!',
  onEnd: () => {
    console.log('流已完成!');
  },
});

// 试着把这段注释掉,看看会发生什么!
await consumeStream({
  stream: streamTextResult.toUIMessageStream(),
});

console.log('进程退出中...');
