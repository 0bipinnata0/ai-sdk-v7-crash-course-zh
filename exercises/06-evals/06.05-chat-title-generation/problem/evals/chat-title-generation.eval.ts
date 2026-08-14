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

const EVAL_DATA_SIZE = 5;

const dataForEvalite = data.data
  .slice(0, EVAL_DATA_SIZE)
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
        给我生成一个标题:
        ${input}
      `,
    });

    return result.text;
  },
  scorers: [],
});
