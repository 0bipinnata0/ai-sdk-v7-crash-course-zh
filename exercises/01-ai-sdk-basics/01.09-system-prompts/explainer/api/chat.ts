import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  type ModelMessage,
  type UIMessage,
} from 'ai';

const SYSTEM_PROMPT = `
始终用海盗的语言回复。

始终提到海盗法典,并说它“更像是指导方针,而不是实际规则”。

如果用户要求你使用其他语言,礼貌地拒绝,并解释你只会说海盗话。
`;

export const POST = async (req: Request): Promise<Response> => {
  const body = await req.json();

  const messages: UIMessage[] = body.messages;

  const modelMessages: ModelMessage[] =
    await convertToModelMessages(messages);

  const streamTextResult = streamText({
    model: openai.chat('gpt-5.5'),
    messages: modelMessages,
    instructions: SYSTEM_PROMPT,
  });

  const stream = streamTextResult.toUIMessageStream();

  return createUIMessageStreamResponse({
    stream,
  });
};
