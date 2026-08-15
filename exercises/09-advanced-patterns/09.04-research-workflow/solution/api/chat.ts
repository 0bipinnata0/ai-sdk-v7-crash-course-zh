import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamObject,
  streamText,
  type ModelMessage,
  type UIMessage,
  type UIMessageStreamWriter,
  toUIMessageStream,
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
  const queriesResult = streamObject({
    model: openai.chat('gpt-5.5'),
    instructions: `
      你是一个乐于助人的助手,负责生成用于在网上搜索信息的查询。

      <rules>
        在生成查询之前先制定计划。计划应该识别出回答问题所需的信息分组。
        计划应该列出回答问题所需的信息点,然后考虑如何把这些信息拆解成查询。
      </rules>

      生成 3-5 个与对话历史相关的查询。

      <output-format>
        以 JSON 对象回复,包含以下属性:
        - plan:描述查询计划的字符串。
        - queries:字符串数组,每个元素代表一个查询。
      </output-format>
    `,
    schema: z.object({
      plan: z.string(),
      queries: z.array(z.string()),
    }),
    messages: modelMessages,
  });

  return queriesResult;
};

const streamQueriesToFrontend = async (
  queriesResult: ReturnType<typeof generateQueriesForTavily>,
  writer: UIMessageStreamWriter<MyMessage>,
) => {
  const queriesPartId = crypto.randomUUID();
  const planPartId = crypto.randomUUID();

  for await (const part of queriesResult.partialObjectStream) {
    if (
      part.queries &&
      part.queries.every((query) => typeof query === 'string')
    ) {
      writer.write({
        type: 'data-queries',
        data: part.queries,
        id: queriesPartId,
      });
    }

    if (part.plan) {
      writer.write({
        type: 'data-plan',
        data: part.plan,
        id: planPartId,
      });
    }
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
  const formattedSources = searchResults
    .map(({ response, query }, i) => {
      return `<search-query index="${i + 1}" query="${query}">
        ${response.results
          .map((res, j) => {
            return `<result index="${j + 1}">
            <title>${res.title}</title>
            <url>${res.url ?? '#'}</url>
            <content>${res.content ?? ''}</content>
          </result>`;
          })
          .join('\n')}
      </search-query>`;
    })
    .join('\n');

  const answerResult = streamText({
    model: openai.chat('gpt-5.5'),
    instructions: `你是一个乐于助人的助手,基于搜索结果回答问题。
      <rules>
      你应该使用搜索结果来回答问题。
      使用搜索结果中的来源来回答问题。
      来源应该以 markdown 链接的形式引用。

      <markdown-link-example>
        你可以看看[这篇文章](https://www.example.com)来回答这个问题。
      </markdown-link-example>

      引用来源时不应该把完整的 URL 显示给用户。相反,使用对来源的简短描述:

      <bad-markdown-link-example>
        这个网站对你有用:[https://www.example.com](https://www.example.com)
      </bad-markdown-link-example>

      </rules>

      <sources>
        ${formattedSources}
      </sources>

      <output-format>
        使用 markdown 格式。
      </output-format>
    `,
    messages,
  });

  writer.merge(
    toUIMessageStream({
      stream: answerResult.stream,
      sendStart: false,
    }),
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

      await streamQueriesToFrontend(queriesResult, writer);

      const searchResults = await callTavilyToGetSearchResults(
        (await queriesResult.object).queries,
      );

      await streamFinalSummary(
        searchResults,
        modelMessages,
        writer,
      );
    },
  });

  return createUIMessageStreamResponse({
    stream,
  });
};
