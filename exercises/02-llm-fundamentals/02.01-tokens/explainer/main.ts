import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const tokenizer = new Tiktoken(
  // 注意:o200k_base 是 GPT-4o 的分词器
  o200k_base,
);

const tokenize = (text: string) => {
  return tokenizer.encode(text);
};

const input = readFileSync(
  path.join(import.meta.dirname, 'input.md'),
  'utf-8',
);

const output = tokenize(input);

console.log('内容长度(字符数):', input.length);
console.log(`token 数量:`, output.length);
console.dir(output, { depth: null, maxArrayLength: 20 });
