import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';

const tokenizer = new Tiktoken(
  // 注意:o200k_base 是 GPT-4o 的分词器
  o200k_base,
);

const tokenize = (text: string) => {
  return tokenizer.encode(text);
};

let text = '';

const NUMBER_OF_TOKENS = 10_000_000;

for (let i = 0; i < NUMBER_OF_TOKENS; i++) {
  text += 'foo ';
}

const tokens = tokenize(text);

console.log(`Token 长度:${tokens.length}`);

await generateText({
  model: google('gemini-2.5-flash-lite'),
  prompt: text,
  // 注意:默认情况下,AI SDK 在请求失败时会重试 3 次。
  // 我们可以通过将 maxRetries 设为 0 来阻止这一行为。
  maxRetries: 0,
});
