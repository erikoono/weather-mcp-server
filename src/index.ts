import express from 'express';
import cors from 'cors';
import { WeatherService } from './services/weather';

const app = express();
const port = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// 天気情報サービス
const weatherService = new WeatherService();

// ルート
app.get('/', (req, res) => {
  res.json({
    name: 'weather-mcp-server',
    version: '1.0.0',
    description: '天気情報を提供するAPIサーバー',
    endpoints: {
      '/weather/:city': '指定された都市の現在の天気情報を取得',
      '/weather/:city/forecast': '指定された都市の天気予報を取得',
    },
  });
});

// 現在の天気情報を取得
app.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { country = 'JP' } = req.query;
    
    const weatherData = await weatherService.getCurrentWeather(city, country as string);
    
    res.json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
    });
  }
});

// 天気予報を取得
app.get('/weather/:city/forecast', async (req, res) => {
  try {
    const { city } = req.params;
    const { country = 'JP', days = '5' } = req.query;
    
    const forecastData = await weatherService.getWeatherForecast(
      city, 
      country as string, 
      parseInt(days as string)
    );
    
    res.json({
      success: true,
      data: forecastData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
    });
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`🌤️ 天気情報APIサーバーが起動しました: http://localhost:${port}`);
  console.log(`📖 APIドキュメント: http://localhost:${port}`);
});

// テスト用にappをエクスポート
export { app };

// CommonJS形式でもエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { app };
} 