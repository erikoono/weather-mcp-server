import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { WeatherService } from '../../src/services/weather';

// WeatherServiceのモック
jest.mock('../../src/services/weather');
const MockedWeatherService = WeatherService as jest.MockedClass<typeof WeatherService>;

// テスト用のExpressアプリを作成
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // モックされたWeatherServiceのインスタンスを作成
  const mockWeatherService = {
    getCurrentWeather: jest.fn(),
    getWeatherForecast: jest.fn(),
  };

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

      const weatherData = await mockWeatherService.getCurrentWeather(city, country as string);

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

      const forecastData = await mockWeatherService.getWeatherForecast(
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

  return app;
};

describe('Weather API Endpoints', () => {
  let app: express.Application;
  let mockWeatherService: any;

  beforeEach(() => {
    app = createTestApp();
    // モック関数を取得
    const WeatherServiceMock = require('../../src/services/weather').WeatherService;
    mockWeatherService = {
      getCurrentWeather: jest.fn(),
      getWeatherForecast: jest.fn(),
    };
    WeatherServiceMock.mockImplementation(() => mockWeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('サーバー情報を返す', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        name: 'weather-mcp-server',
        version: '1.0.0',
        description: '天気情報を提供するAPIサーバー',
        endpoints: {
          '/weather/:city': '指定された都市の現在の天気情報を取得',
          '/weather/:city/forecast': '指定された都市の天気予報を取得',
        },
      });
    });
  });

  describe('GET /weather/:city', () => {
    const mockWeatherData = {
      temperature: 21,
      feelsLike: 22,
      humidity: 65,
      windSpeed: 3.2,
      description: '曇り',
      visibility: 10,
      pressure: 1013,
      city: 'Tokyo',
      country: 'JP',
      timestamp: new Date(),
    };

    it('正常な天気データを返す', async () => {
      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(mockWeatherData);

      const response = await request(app).get('/weather/Tokyo');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockWeatherData,
      });
      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith('Tokyo', 'JP');
    });

    it('国コードを指定して天気データを取得する', async () => {
      mockWeatherService.getCurrentWeather.mockResolvedValueOnce(mockWeatherData);

      const response = await request(app).get('/weather/London?country=GB');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockWeatherData,
      });
      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith('London', 'GB');
    });

    it('エラーが発生した場合に適切なエラーレスポンスを返す', async () => {
      const errorMessage = '都市 "InvalidCity" が見つかりませんでした';
      mockWeatherService.getCurrentWeather.mockRejectedValueOnce(new Error(errorMessage));

      const response = await request(app).get('/weather/InvalidCity');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: errorMessage,
      });
    });

    it('不明なエラーの場合に適切なエラーレスポンスを返す', async () => {
      mockWeatherService.getCurrentWeather.mockRejectedValueOnce('Unknown error');

      const response = await request(app).get('/weather/Tokyo');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: '不明なエラー',
      });
    });
  });

  describe('GET /weather/:city/forecast', () => {
    const mockForecastData = [
      {
        temperature: 21,
        feelsLike: 22,
        humidity: 65,
        windSpeed: 3.2,
        description: '曇り',
        visibility: 10,
        pressure: 1013,
        city: 'Tokyo',
        country: 'JP',
        timestamp: new Date(),
      },
      {
        temperature: 23,
        feelsLike: 24,
        humidity: 60,
        windSpeed: 2.8,
        description: '晴れ',
        visibility: 12,
        pressure: 1012,
        city: 'Tokyo',
        country: 'JP',
        timestamp: new Date(),
      },
    ];

    it('正常な天気予報データを返す', async () => {
      mockWeatherService.getWeatherForecast.mockResolvedValueOnce(mockForecastData);

      const response = await request(app).get('/weather/Tokyo/forecast');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockForecastData,
      });
      expect(mockWeatherService.getWeatherForecast).toHaveBeenCalledWith('Tokyo', 'JP', 5);
    });

    it('日数を指定して天気予報を取得する', async () => {
      mockWeatherService.getWeatherForecast.mockResolvedValueOnce(mockForecastData);

      const response = await request(app).get('/weather/Tokyo/forecast?days=3');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockForecastData,
      });
      expect(mockWeatherService.getWeatherForecast).toHaveBeenCalledWith('Tokyo', 'JP', 3);
    });

    it('国コードと日数を指定して天気予報を取得する', async () => {
      mockWeatherService.getWeatherForecast.mockResolvedValueOnce(mockForecastData);

      const response = await request(app).get('/weather/London/forecast?country=GB&days=7');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockForecastData,
      });
      expect(mockWeatherService.getWeatherForecast).toHaveBeenCalledWith('London', 'GB', 7);
    });

    it('エラーが発生した場合に適切なエラーレスポンスを返す', async () => {
      const errorMessage = 'APIキーが無効です';
      mockWeatherService.getWeatherForecast.mockRejectedValueOnce(new Error(errorMessage));

      const response = await request(app).get('/weather/Tokyo/forecast');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: errorMessage,
      });
    });
  });

  describe('CORS', () => {
    it('CORSヘッダーが設定されている', async () => {
      const response = await request(app).get('/');

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });
}); 