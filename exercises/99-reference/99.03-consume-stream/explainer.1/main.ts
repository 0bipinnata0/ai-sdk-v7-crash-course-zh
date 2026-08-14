import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

console.log('进程启动中...');

const streamTextResult = streamText({
  model: google('gemini-2.5-flash'),
  prompt: '你好,世界!',
  onFinish: () => {
    console.log('流已完成!');
  },
});

// 试着把这行注释掉,看看会发生什么!
await streamTextResult.consumeStream();

console.log('进程退出中...');
