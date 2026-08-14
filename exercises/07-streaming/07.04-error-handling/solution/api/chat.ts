import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  RetryError,
} from 'ai';

export const POST = async (req: Request): Promise<Response> => {
  // 所有 AI SDK 错误都可以在这里找到:
  // https://ai-sdk.dev/docs/reference/ai-sdk-errors
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      throw new RetryError({
        errors: [new Error('发生了一个错误')],
        message: '超过最大重试次数',
        reason: 'maxRetriesExceeded',
      });
    },
    onError(error) {
      if (RetryError.isInstance(error)) {
        return `无法完成请求,请重试。`;
      }

      return '发生了未知错误';
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
