import { WeatherService, WeatherData } from '../../src/services/weather';
import axios from 'axios';

// axiosのモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  let weatherService: WeatherService;

  beforeEach(() => {
    // テスト用のAPIキーを設定
    process.env.OPENWEATHER_API_KEY = 'test-api-key';
    weatherService = new WeatherService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('APIキーが設定されていない場合にエラーを投げる', () => {
      delete process.env.OPENWEATHER_API_KEY;
      expect(() => new WeatherService()).toThrow('OPENWEATHER_API_KEYが設定されていません。.envファイルを確認してください。');
    });

    it('APIキーが設定されている場合に正常にインスタンス化される', () => {
      process.env.OPENWEATHER_API_KEY = 'test-api-key';
      expect(() => new WeatherService()).not.toThrow();
    });
  });

  describe('getCurrentWeather', () => {
    const mockWeatherResponse = {
      data: {
        main: {
          temp: 20.5,
          feels_like: 22.1,
          humidity: 65,
          pressure: 1013,
        },
        weather: [
          {
            description: '曇り',
          },
        ],
        wind: {
          speed: 3.2,
        },
        visibility: 10000,
        name: 'Tokyo',
        sys: {
          country: 'JP',
        },
      },
    };

    it('正常な天気データを返す', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockWeatherResponse);

      const result = await weatherService.getCurrentWeather('Tokyo', 'JP');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather',
        {
          params: {
            q: 'Tokyo,JP',
            appid: 'test-api-key',
            units: 'metric',
            lang: 'ja',
          },
        }
      );

      expect(result).toEqual({
        temperature: 21,
        feelsLike: 22,
        humidity: 65,
        windSpeed: 3.2,
        description: '曇り',
        visibility: 10,
        pressure: 1013,
        city: 'Tokyo',
        country: 'JP',
        timestamp: expect.any(Date),
      });
    });

    it('都市が見つからない場合にエラーを投げる', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'city not found' },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(weatherService.getCurrentWeather('InvalidCity')).rejects.toThrow(
        '都市 "InvalidCity" が見つかりませんでした'
      );
    });

    it('APIキーが無効な場合にエラーを投げる', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Invalid API key' },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(weatherService.getCurrentWeather('Tokyo')).rejects.toThrow('APIキーが無効です');
    });

    it('その他のエラーの場合に適切なエラーメッセージを投げる', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(weatherService.getCurrentWeather('Tokyo')).rejects.toThrow(
        '天気情報の取得に失敗しました'
      );
    });

    it('ネットワークエラーの場合に適切なエラーメッセージを投げる', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValueOnce(networkError);

      await expect(weatherService.getCurrentWeather('Tokyo')).rejects.toThrow(
        '予期しないエラーが発生しました: Network Error'
      );
    });
  });

  describe('getWeatherForecast', () => {
    const mockForecastResponse = {
      data: {
        list: [
          {
            dt: 1640995200, // 2022-01-01 00:00:00
            main: {
              temp: 15.2,
              feels_like: 16.1,
              humidity: 70,
              pressure: 1012,
            },
            weather: [
              {
                description: '晴れ',
              },
            ],
            wind: {
              speed: 2.5,
            },
            visibility: 10000,
          },
          {
            dt: 1641006000, // 2022-01-01 03:00:00
            main: {
              temp: 16.8,
              feels_like: 17.5,
              humidity: 68,
              pressure: 1011,
            },
            weather: [
              {
                description: '曇り',
              },
            ],
            wind: {
              speed: 3.1,
            },
            visibility: 8000,
          },
        ],
        city: {
          name: 'Tokyo',
          country: 'JP',
        },
      },
    };

    it('正常な天気予報データを返す', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockForecastResponse);

      const result = await weatherService.getWeatherForecast('Tokyo', 'JP', 2);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/forecast',
        {
          params: {
            q: 'Tokyo,JP',
            appid: 'test-api-key',
            units: 'metric',
            lang: 'ja',
            cnt: 16, // 2日 * 8
          },
        }
      );

      expect(result).toHaveLength(1); // 同じ日付のデータは1つにまとめられる
      expect(result[0]).toEqual({
        temperature: 16,
        feelsLike: 17,
        humidity: 69,
        windSpeed: 2.8,
        description: '晴れ',
        visibility: 9,
        pressure: 1012,
        city: 'Tokyo',
        country: 'JP',
        timestamp: expect.any(Date),
      });
    });

    it('デフォルトの日数（5日）で天気予報を取得する', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockForecastResponse);

      await weatherService.getWeatherForecast('Tokyo');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/forecast',
        {
          params: {
            q: 'Tokyo,JP',
            appid: 'test-api-key',
            units: 'metric',
            lang: 'ja',
            cnt: 40, // 5日 * 8
          },
        }
      );
    });

    it('都市が見つからない場合にエラーを投げる', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'city not found' },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(weatherService.getWeatherForecast('InvalidCity')).rejects.toThrow(
        '都市 "InvalidCity" が見つかりませんでした'
      );
    });

    it('APIキーが無効な場合にエラーを投げる', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Invalid API key' },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(weatherService.getWeatherForecast('Tokyo')).rejects.toThrow('APIキーが無効です');
    });
  });
}); 