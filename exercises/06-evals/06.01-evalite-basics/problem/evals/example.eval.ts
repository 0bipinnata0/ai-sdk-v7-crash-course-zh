import { evalite } from 'evalite';

evalite('Capitals', {
  data: () => [
    {
      input: '法国的首都是哪里?',
      expected: '巴黎',
    },
    {
      input: '德国的首都是哪里?',
      expected: '柏林',
    },
    {
      input: '意大利的首都是哪里?',
      expected: '罗马',
    },
  ],
  task: async (input) => {
    const capitalResult = TODO; // 实现这个!

    return capitalResult.text;
  },
  scorers: [
    {
      name: 'includes',
      scorer: ({ input, output, expected }) => {
        return output.includes(expected!) ? 1 : 0;
      },
    },
  ],
});
