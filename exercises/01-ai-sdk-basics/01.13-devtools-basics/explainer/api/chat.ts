import { openai } from '@ai-sdk/openai';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  wrapLanguageModel,
  type ModelMessage,
  type UIMessage,
  toUIMessageStream,
} from 'ai';

// 用 DevTools 中间件包装模型
// 在单独的终端中运行 `npx @ai-sdk/devtools@latest`
// 然后打开 http://localhost:4983 查看 LLM 调用
const model = wrapLanguageModel({
  model: openai.chat('gpt-5.5'),
  middleware: devToolsMiddleware(),
});

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: UIMessage[] = body.messages;

  const modelMessages: ModelMessage[] =
    await convertToModelMessages(messages);

  const result = streamText({
    model,
    messages: modelMessages,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
};
