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
      // TODO:使用以下方式检查错误是否是 RetryError:
      // RetryError.isInstance(error)
      if (TODO) {
        // TODO:如果是,返回一条告诉用户重试的消息
        return TODO;
      }

      // TODO:如果错误不是 RetryError,返回一条默认消息
      return TODO;
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
