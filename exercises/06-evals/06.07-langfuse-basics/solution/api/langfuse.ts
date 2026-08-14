import { LangfuseSpanProcessor } from '@langfuse/otel';
import { LangfuseVercelAiSdkIntegration } from '@langfuse/vercel-ai-sdk';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { registerTelemetry } from 'ai';

export const langfuseSpanProcessor = new LangfuseSpanProcessor();

export const otelSDK = new NodeSDK({
  spanProcessors: [langfuseSpanProcessor],
});

otelSDK.start();

registerTelemetry(new LangfuseVercelAiSdkIntegration());
