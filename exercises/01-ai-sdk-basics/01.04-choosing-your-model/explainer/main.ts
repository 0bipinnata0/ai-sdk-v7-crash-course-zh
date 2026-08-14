// 需要在 .env 中设置 OPENAI_API_KEY 环境变量
import { openai } from '@ai-sdk/openai';

// 需要在 .env 中设置 GOOGLE_GENERATIVE_AI_API_KEY 环境变量
import { google } from '@ai-sdk/google';

// 需要在 .env 中设置 ANTHROPIC_API_KEY 环境变量
import { anthropic } from '@ai-sdk/anthropic';

const model = openai('gpt-4o-mini');

console.dir(model, { depth: null });
