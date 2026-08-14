import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from 'ai';

export type MyMessage = UIMessage<unknown, {}>;

const text = `你好,朋友!你好吗?我叫 Matthew。很高兴今天见到你。希望你今天过得愉快。我想介绍一下自己,并告诉你,我会在这里帮助你处理任何需要的事情。无论你是有什么问题、项目上需要协助,还是只想聊聊天,都欢迎随时开口。我喜欢学习新事物、认识新朋友,也喜欢一起协作解决有趣的问题。那么,跟我说说你自己吧!今天是什么把你带到这里,我又能帮上什么忙呢?`;

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: UIMessage[] } = await req.json();
  const { messages } = body;

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      const textPartId = crypto.randomUUID();

      writer.write({
        type: 'text-start',
        id: textPartId,
      });

      const splitText = text.split('');

      for (const word of splitText) {
        writer.write({
          type: 'text-delta',
          delta: word,
          id: textPartId,
        });

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      writer.write({
        type: 'text-end',
        id: textPartId,
      });
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
