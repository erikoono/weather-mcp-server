import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  visibility: number;
  pressure: number;
  city: string;
  country: string;
  timestamp: Date;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENWEATHER_API_KEYが設定されていません。.envファイルを確認してください。');
    }
  }

  async getCurrentWeather(city: string, country: string = 'JP'): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: `${city},${country}`,
          appid: this.apiKey,
          units: 'metric',
          lang: 'ja',
        },
      });

      const data = response.data;
      
      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 10) / 10,
        description: data.weather[0].description,
        visibility: Math.round(data.visibility / 1000 * 10) / 10,
        pressure: data.main.pressure,
        city: data.name,
        country: data.sys.country,
        timestamp: new Date(),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`都市 "${city}" が見つかりませんでした`);
        } else if (error.response?.status === 401) {
          throw new Error('APIキーが無効です');
        } else {
          throw new Error(`天気情報の取得に失敗しました: ${error.message}`);
        }
      }
      throw new Error(`予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  async getWeatherForecast(city: string, country: string = 'JP', days: number = 5): Promise<WeatherData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: `${city},${country}`,
          appid: this.apiKey,
          units: 'metric',
          lang: 'ja',
          cnt: days * 8, // 3時間ごとのデータ
        },
      });

      const forecasts: WeatherData[] = [];
      const dailyData = new Map<string, any>();

      // 日付ごとにデータをグループ化
      response.data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyData.has(date)) {
          dailyData.set(date, []);
        }
        dailyData.get(date).push(item);
      });

      // 各日の平均値を計算
      dailyData.forEach((items, date) => {
        const avgTemp = items.reduce((sum: number, item: any) => sum + item.main.temp, 0) / items.length;
        const avgFeelsLike = items.reduce((sum: number, item: any) => sum + item.main.feels_like, 0) / items.length;
        const avgHumidity = items.reduce((sum: number, item: any) => sum + item.main.humidity, 0) / items.length;
        const avgWindSpeed = items.reduce((sum: number, item: any) => sum + item.wind.speed, 0) / items.length;
        const avgPressure = items.reduce((sum: number, item: any) => sum + item.main.pressure, 0) / items.length;

        forecasts.push({
          temperature: Math.round(avgTemp),
          feelsLike: Math.round(avgFeelsLike),
          humidity: Math.round(avgHumidity),
          windSpeed: Math.round(avgWindSpeed * 10) / 10,
          description: items[0].weather[0].description,
          visibility: Math.round((items[0].visibility || 10000) / 1000 * 10) / 10,
          pressure: Math.round(avgPressure),
          city: response.data.city.name,
          country: response.data.city.country,
          timestamp: new Date(date),
        });
      });

      return forecasts.slice(0, days);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`都市 "${city}" が見つかりませんでした`);
        } else if (error.response?.status === 401) {
          throw new Error('APIキーが無効です');
        } else {
          throw new Error(`天気予報の取得に失敗しました: ${error.message}`);
        }
      }
      throw new Error(`予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }
} 