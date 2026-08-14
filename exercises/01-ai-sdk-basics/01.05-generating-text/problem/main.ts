import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// TODO:选择一个模型。我推荐使用 Google Gemini 模型:
// gemini-2.5-flash-lite
const model = TODO;

const prompt = '法国的首都是哪里?';

const result = TODO; // TODO:使用 generateText 获取结果

console.log(result.text);
