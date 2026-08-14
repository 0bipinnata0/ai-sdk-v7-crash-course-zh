import type {
  InferToolInput,
  InferToolOutput,
  UIMessage,
  UIMessageStreamWriter,
} from 'ai';
import type { MyDataPart } from './types.ts';
import { tool } from 'ai';
import { z } from 'zod';

export const getWeatherInformation = (
  // 需要像这样标注类型,以避免循环类型依赖
  // 这里的类型标注不是必需的,但能为 `writer.write()` 提供类型安全
  // 例如 `data-weather` 的自动补全和类型安全的 `data` 对象
  writer: UIMessageStreamWriter<UIMessage<never, MyDataPart>>,
) =>
  tool({
    description: '向用户展示指定城市的天气',
    inputSchema: z.object({ city: z.string() }),
    execute: async ({ city }, { toolCallId: id }) => {
      // 写入初始消息部件
      writer.write({
        type: 'data-weather',
        data: {
          location: city,
          weather: undefined,
          loading: true,
        },
        id,
      });

      // 添加 2 秒的人为延迟
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const weatherOptions = [
        'sunny',
        'cloudy',
        'rainy',
        'snowy',
        'windy',
      ];

      const weather =
        weatherOptions[
          Math.floor(Math.random() * weatherOptions.length)
        ];

      // 用相同的 id 添加天气值
      writer.write({
        type: 'data-weather',
        data: { weather, loading: true },
        id,
      });

      // 再添加 2 秒的人为延迟
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 生成 -10 到 40 摄氏度之间的随机温度
      const temperature = Math.floor(Math.random() * 51) - 10;

      // 用相同的 id 写入温度值
      writer.write({
        type: 'data-weather',
        data: { temperature, loading: false },
        id,
      });

      return { city, weather };
    },
  });

// 我们的数据库 schema 中使用的类型
export type getWeatherInformationInput = InferToolInput<
  ReturnType<typeof getWeatherInformation>
>;
export type getWeatherInformationOutput = InferToolOutput<
  ReturnType<typeof getWeatherInformation>
>;

export const getLocation = tool({
  description: '获取用户位置。',
  inputSchema: z.object({}),
  // 客户端工具需要显式标注输出 schema 的类型
  outputSchema: z.object({ location: z.string() }),
});

export type getLocationInput = InferToolInput<
  typeof getLocation
>;
export type getLocationOutput = InferToolOutput<
  typeof getLocation
>;

export const tools = (writer: UIMessageStreamWriter) => ({
  getWeatherInformation: getWeatherInformation(writer), // 传入 stream writer
  getLocation,
});
