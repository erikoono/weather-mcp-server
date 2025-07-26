import { WeatherService } from '../src/services/weather';

// 簡単なテスト
describe('Simple Tests', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    expect('hello' + ' world').toBe('hello world');
  });

  it('should handle array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr[0]).toBe(1);
  });

  it('should handle object operations', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(42);
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
}); 