import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

// TODO:选择一个模型。我推荐使用 Google Gemini 模型:
// gemini-2.5-flash-lite

const model = openai("gpt-5.5");

const prompt = '法国的首都是哪里?';

const result = await generateText({ model, prompt }); // TODO:使用 generateText 获取结果

console.log(result.text);
