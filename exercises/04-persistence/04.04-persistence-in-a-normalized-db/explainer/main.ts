import { mapUIMessagePartsToDBParts } from './mapping.ts';
import type { MyUIMessage } from './types.ts';

const message: MyUIMessage = {
  id: '123',
  role: 'user',
  parts: [
    {
      type: 'text',
      text: '你好!',
    },
    {
      type: 'reasoning',
      text: '我正在思考...',
    },
    {
      type: 'tool-getWeatherInformation',
      state: 'output-available',
      toolCallId: '123',
      input: {
        city: 'London',
      },
      output: {
        city: 'London',
        weather: 'sunny',
      },
    },
  ],
};

const dbMessageParts = mapUIMessagePartsToDBParts(
  message.parts,
  message.id,
);

console.dir(dbMessageParts, { depth: null });
