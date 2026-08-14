// TODO:使用 @opentelemetry/sdk-node 包中的 NodeSDK 类
// 声明 otelSDK 变量,
// 并把 langfuse-vercel 包中的 LangfuseExporter 实例
// 作为 traceExporter 传给它
export const otelSDK = TODO;

otelSDK.start();

// TODO:使用 langfuse 包中的 Langfuse 类
// 声明 langfuse 变量,并传入以下参数:
// - environment: process.env.NODE_ENV
// - publicKey: process.env.LANGFUSE_PUBLIC_KEY
// - secretKey: process.env.LANGFUSE_SECRET_KEY
// - baseUrl: process.env.LANGFUSE_BASE_URL
export const langfuse = TODO;
