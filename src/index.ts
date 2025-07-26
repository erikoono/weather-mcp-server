import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WeatherService } from './services/weather.js';

async function main() {
  const server = new Server(
    {
      name: 'weather-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  const weatherService = new WeatherService();

  // 天気情報ツールを登録
  server.setRequestHandler(
    {
      name: 'get_weather',
      description: '指定された都市の現在の天気情報を取得します',
      inputSchema: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '天気を取得したい都市名（例: Tokyo, Osaka, Kyoto）',
          },
          country: {
            type: 'string',
            description: '国コード（例: JP, US, UK）',
            default: 'JP',
          },
        },
        required: ['city'],
      },
    },
    async (request) => {
      const { city, country = 'JP' } = request.arguments as { city: string; country?: string };
      
      try {
        const weatherData = await weatherService.getCurrentWeather(city, country);
        
        const weatherInfo = `
🌤️ **${city}の天気情報**

🌡️ **気温**: ${weatherData.temperature}°C
🌡️ **体感温度**: ${weatherData.feelsLike}°C
💧 **湿度**: ${weatherData.humidity}%
🌬️ **風速**: ${weatherData.windSpeed} m/s
☁️ **天気**: ${weatherData.description}
👁️ **視界**: ${weatherData.visibility} km
🌅 **気圧**: ${weatherData.pressure} hPa

最終更新: ${new Date().toLocaleString('ja-JP')}
        `.trim();

        return {
          content: [{ type: 'text', text: weatherInfo }],
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `❌ エラー: ${city}の天気情報を取得できませんでした。${error instanceof Error ? error.message : '不明なエラー'}` 
          }],
        };
      }
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('天気情報MCPサーバーが起動しました');
}

main().catch(console.error); 