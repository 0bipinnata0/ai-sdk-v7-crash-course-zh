import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// TODO:选择一个模型。我推荐使用 GPT 模型:
// gpt-5.5
const model = TODO;

const prompt = '法国的首都是哪里?';

const result = TODO; // TODO:使用 generateText 获取结果

console.log(result.text);
