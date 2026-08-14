import { defineConfig } from 'evalite/config';

export default defineConfig({
  // 中转站的 GPT 调用较慢(task + scorer 两次串行调用),
  // 默认 30 秒不够用,放宽到 3 分钟
  testTimeout: 180_000,
});
