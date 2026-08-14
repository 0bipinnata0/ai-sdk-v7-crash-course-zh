import { openai } from '@ai-sdk/openai';
import { streamText, type UIMessage } from 'ai';

type MyMetadata = {
  // 生成消息的长度
  length: number;
};

type MyMessage = UIMessage<MyMetadata>;

const streamTextResult = streamText({
  model: openai.chat('gpt-5.5'),
  prompt: '你好,世界!',
});

let totalLength = 0;

const stream = streamTextResult.toUIMessageStream<MyMessage>({
  messageMetadata: ({ part }) => {
    if (part.type === 'text-delta') {
      totalLength += part.text.length;
    }

    if (part.type === 'finish') {
      return {
        length: totalLength,
      };
    }
  },
  onEnd: ({ responseMessage }) => {
    console.log(responseMessage.metadata);
  },
});

for await (const chunk of stream) {
  console.log(chunk);
}
