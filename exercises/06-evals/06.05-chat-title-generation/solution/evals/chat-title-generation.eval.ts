import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { evalite } from 'evalite';
import { readFileSync } from 'fs';
import Papa from 'papaparse';
import path from 'path';

const csvFile = readFileSync(
  path.join(import.meta.dirname, '../../titles-dataset.csv'),
  'utf-8',
);

const data = Papa.parse<{ Input: string; Output: string }>(
  csvFile,
  {
    header: true,
    skipEmptyLines: true,
  },
);

const EVAL_DATA_SIZE = 10;

const dataForEvalite = data.data
  .slice(0, 0 + EVAL_DATA_SIZE)
  .map((row) => ({
    input: row.Input,
    expected: row.Output,
  }));

evalite('Chat Title Generation', {
  data: () => dataForEvalite,
  task: async (input) => {
    const result = await generateText({
      model: openai.chat('gpt-5.5'),
      prompt: `
        你是一个乐于助人的助手,可以为对话生成标题。标题将用于在聊天应用中组织对话。

        <conversation-history>
        ${input}
        </conversation-history>

        找到能抓住对话精髓的最简洁标题。
        标题最多 30 个字符。
        标题使用书面语风格。结尾不要句号。
        不要使用标点符号或表情符号。
        如果对话中使用了缩写词,在标题中使用它们。
        在标题中使用正式的措辞,比如“故障排查”、“讨论”、“支持”、“选择”、“调研”等。
        由于列表中的所有条目都是对话,标题中不要使用“聊天”、“对话”或“讨论”这些词——UI 已经隐含了这一点。

        为这段对话生成一个标题。
        只返回标题。
      `,
    });

    return result.text;
  },
  scorers: [],
});
