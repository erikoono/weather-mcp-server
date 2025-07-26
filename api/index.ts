import express from 'express';
import cors from 'cors';
import { WeatherService } from '../src/services/weather.js';

const app = express();
const weatherService = new WeatherService();

// CORS設定
app.use(cors());

// JSONパーサー
app.use(express.json());

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({
    message: '🌤️ 天気情報APIサーバー',
    version: '1.0.0',
    endpoints: {
      root: '/',
      currentWeather: '/weather/:city',
      forecast: '/weather/:city/forecast'
    },
    documentation: 'https://github.com/your-username/weather-mcp-server'
  });
});

// 現在の天気を取得
app.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const weather = await weatherService.getCurrentWeather(city);
    res.json(weather);
  } catch (error) {
    console.error('天気取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '天気情報の取得に失敗しました'
    });
  }
});

// 天気予報を取得
app.get('/weather/:city/forecast', async (req, res) => {
  try {
    const { city } = req.params;
    const forecast = await weatherService.getWeatherForecast(city);
    res.json(forecast);
  } catch (error) {
    console.error('予報取得エラー:', error);
    res.status(500).json({
      success: false,
      error: '天気予報の取得に失敗しました'
    });
  }
});

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('サーバーエラー:', err);
  res.status(500).json({
    success: false,
    error: 'サーバー内部エラーが発生しました'
  });
});

// 404ハンドリング
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'エンドポイントが見つかりません'
  });
});

// Vercel Functions用のエクスポート
export default app; 