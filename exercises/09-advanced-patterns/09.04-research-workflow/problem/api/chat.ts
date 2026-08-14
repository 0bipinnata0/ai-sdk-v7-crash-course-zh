import { google } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamObject,
  streamText,
  type ModelMessage,
  type UIMessage,
  type UIMessageStreamWriter,
} from 'ai';
import { tavily } from '@tavily/core';
import { z } from 'zod';

export type MyMessage = UIMessage<
  unknown,
  {
    queries: string[];
    plan: string;
  }
>;

const generateQueriesForTavily = (
  modelMessages: ModelMessage[],
) => {
  // TODO:使用 streamObject 生成搜索计划,
  // 以及用于在网上搜索信息的查询。
  // 计划应该识别出回答问题所需的信息分组。
  // 计划应该列出回答问题所需的信息点,
  // 然后考虑如何把这些信息拆解成查询。
  // 生成 3-5 个与对话历史相关的查询。
  // 以 JSON 对象回复,包含以下属性:
  // - plan:描述查询计划的字符串。
  // - queries:字符串数组,每个元素代表一个查询。
  const queriesResult = TODO;

  return queriesResult;
};

const displayQueriesInFrontend = async (
  queriesResult: ReturnType<typeof generateQueriesForTavily>,
  writer: UIMessageStreamWriter<MyMessage>,
) => {
  const queriesPartId = crypto.randomUUID();
  const planPartId = crypto.randomUUID();

  for await (const part of queriesResult.partialObjectStream) {
    // TODO:把查询和计划流式传输到前端
    TODO;
  }
};

const callTavilyToGetSearchResults = async (
  queries: string[],
) => {
  const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY,
  });

  const searchResults = await Promise.all(
    queries.map(async (query) => {
      const response = await tavilyClient.search(query, {
        maxResults: 5,
      });

      return {
        query,
        response,
      };
    }),
  );

  return searchResults;
};

const streamFinalSummary = async (
  searchResults: Awaited<
    ReturnType<typeof callTavilyToGetSearchResults>
  >,
  messages: ModelMessage[],
  writer: UIMessageStreamWriter<MyMessage>,
) => {
  // TODO:使用 streamText 生成给用户的最终回复。
  // 回复应该是搜索结果的总结,
  // 并附上信息来源。
  const answerResult = TODO;

  writer.merge(
    // 注意:我们传入 sendStart: false,因为我们已经
    // 向前端发送过 'start' 消息部件了。
    answerResult.toUIMessageStream({ sendStart: false }),
  );
};

export const POST = async (req: Request): Promise<Response> => {
  const body: { messages: MyMessage[] } = await req.json();
  const { messages } = body;

  const modelMessages = await convertToModelMessages(messages);

  const stream = createUIMessageStream<MyMessage>({
    execute: async ({ writer }) => {
      const queriesResult =
        generateQueriesForTavily(modelMessages);

      await displayQueriesInFrontend(queriesResult, writer);

      const scrapedPages = await callTavilyToGetSearchResults(
        (await queriesResult.object).queries,
      );

      await streamFinalSummary(
        scrapedPages,
        modelMessages,
        writer,
      );
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
