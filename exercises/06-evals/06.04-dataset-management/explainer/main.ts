import path from 'node:path';

console.log(
  `请阅读位于 ${path.join(import.meta.dirname, 'readme.md')} 的 readme 文件`,
);
