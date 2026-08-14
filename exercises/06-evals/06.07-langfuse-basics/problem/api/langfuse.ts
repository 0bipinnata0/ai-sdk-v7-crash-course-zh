// TODO:搭建 Langfuse 的 OpenTelemetry 导出:
// 1. 使用 @langfuse/otel 包中的 LangfuseSpanProcessor 类,
//    创建实例并导出为 langfuseSpanProcessor
// 2. 使用 @opentelemetry/sdk-node 包中的 NodeSDK 类
//    声明 otelSDK 变量,
//    并把 span processor 传入 spanProcessors 数组
export const langfuseSpanProcessor = TODO;

export const otelSDK = TODO;

otelSDK.start();

// TODO:使用 ai 包中的 registerTelemetry 函数,
// 注册 @langfuse/vercel-ai-sdk 包中的
// LangfuseVercelAiSdkIntegration 实例
TODO;
