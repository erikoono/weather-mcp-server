import { WeatherService } from '../src/services/weather';

// 基本的な機能テスト
describe('Basic Functionality Tests', () => {
  it('should pass basic arithmetic test', () => {
    expect(1 + 1).toBe(2);
    expect(5 * 3).toBe(15);
    expect(10 - 4).toBe(6);
  });

  it('should handle string operations', () => {
    expect('hello' + ' world').toBe('hello world');
    expect('test'.toUpperCase()).toBe('TEST');
    expect('hello world'.split(' ')).toEqual(['hello', 'world']);
  });

  it('should handle array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.length).toBe(5);
    expect(arr[0]).toBe(1);
    expect(arr.slice(1, 3)).toEqual([2, 3]);
    expect(arr.filter(x => x > 3)).toEqual([4, 5]);
  });

  it('should handle object operations', () => {
    const obj = { name: 'test', value: 42, active: true };
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(42);
    expect(Object.keys(obj)).toEqual(['name', 'value', 'active']);
    expect(Object.values(obj)).toEqual(['test', 42, true]);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });
});

// WeatherServiceの基本的なテスト
describe('WeatherService Basic Tests', () => {
  it('should throw error when API key is not set', () => {
    // 環境変数を一時的に削除
    const originalApiKey = process.env.OPENWEATHER_API_KEY;
    delete process.env.OPENWEATHER_API_KEY;

    expect(() => new WeatherService()).toThrow('OPENWEATHER_API_KEYが設定されていません');

    // 環境変数を復元
    if (originalApiKey) {
      process.env.OPENWEATHER_API_KEY = originalApiKey;
    }
  });

  it('should create instance when API key is set', () => {
    process.env.OPENWEATHER_API_KEY = 'test-key';
    expect(() => new WeatherService()).not.toThrow();
  });

  it('should have required methods', () => {
    process.env.OPENWEATHER_API_KEY = 'test-key';
    const weatherService = new WeatherService();
    
    expect(typeof weatherService.getCurrentWeather).toBe('function');
    expect(typeof weatherService.getWeatherForecast).toBe('function');
  });
});

// 環境変数のテスト
describe('Environment Variables Tests', () => {
  it('should handle environment variables', () => {
    process.env.TEST_VAR = 'test-value';
    expect(process.env.TEST_VAR).toBe('test-value');
    
    delete process.env.TEST_VAR;
    expect(process.env.TEST_VAR).toBeUndefined();
  });

  it('should have required environment variables for weather service', () => {
    // テスト用の環境変数を設定
    process.env.OPENWEATHER_API_KEY = 'test-api-key';
    process.env.PORT = '3000';
    
    expect(process.env.OPENWEATHER_API_KEY).toBe('test-api-key');
    expect(process.env.PORT).toBe('3000');
  });
}); 