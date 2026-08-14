import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';

const tokenizer = new Tiktoken(
  // 注意:o200k_base 是 GPT-4o 的分词器
  o200k_base,
);

const tokenize = (text: string) => {
  return tokenizer.encode(text);
};

const DATA = [
  {
    url: 'https://aihero.dev',
    title: 'AI Hero',
  },
  {
    url: 'https://totaltypescript.com',
    title: 'Total TypeScript',
  },
  {
    url: 'https://mattpocock.com',
    title: 'Matt Pocock',
  },
  {
    url: 'https://twitter.com/mattpocockuk',
    title: 'Twitter',
  },
];

const asXML = DATA.map(
  (item) =>
    `<item url="${item.url}" title="${item.title}"></item>`,
).join('\n');

const asJSON = JSON.stringify(DATA, null, 2);

const asMarkdown = DATA.map(
  (item) => `- [${item.title}](${item.url})`,
).join('\n');

console.log('Markdown token 数:', tokenize(asMarkdown).length);
console.log(asMarkdown);
console.log('--------------------------------');
console.log('XML token 数:', tokenize(asXML).length);
console.log(asXML);
console.log('--------------------------------');
console.log('JSON token 数:', tokenize(asJSON).length);
console.log(asJSON);
