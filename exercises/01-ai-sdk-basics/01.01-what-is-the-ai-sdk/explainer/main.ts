import path from 'node:path';

console.log(
  `查看 readme,位于 ${path.join(
    import.meta.dirname,
    'readme.md',
  )}`,
);
