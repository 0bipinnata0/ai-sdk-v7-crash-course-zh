import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';
import { styleText } from 'util';

const tokenizer = new Tiktoken(
  // 注意:o200k_base 是 GPT-4o 的分词器
  o200k_base,
);

const tokenize = (text: string) => {
  return tokenizer.encode(text);
};

const tokensInCache = tokenize(
  // 注意:修改这里可以改变缓存内容
  [
    '用户:法国的首都是哪里?',
    '助手:巴黎',
  ].join('\n'),
);

const inputTokens = tokenize(
  // 注意:修改这里可以改变输入内容
  [
    '用户:法国的首都是哪里?',
    '助手:巴黎',
    '用户:德国的首都是哪里?',
  ].join('\n'),
);

let numberOfMatchingTokens = 0;
for (let i = 0; i < inputTokens.length; i++) {
  if (inputTokens[i] === tokensInCache[i]) {
    numberOfMatchingTokens++;
  } else {
    break;
  }
}

// 已缓存和未缓存的 token
const cachedTokens = tokensInCache.slice(
  0,
  numberOfMatchingTokens,
);
const uncachedTokens = inputTokens.slice(numberOfMatchingTokens);

// 已缓存和未缓存的输出文本
const cachedText = tokenizer.decode(cachedTokens);
const uncachedText = tokenizer.decode(uncachedTokens);

console.log('已缓存 token 数:', cachedTokens.length);
console.log(
  styleText(['bold', 'green'], cachedText) +
    styleText(['red'], uncachedText),
);
