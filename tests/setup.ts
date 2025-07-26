import dotenv from 'dotenv';

// テスト用の環境変数を設定
dotenv.config({ path: '.env.test' });

// デフォルトのテスト用環境変数
process.env.OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'test-api-key';
process.env.PORT = process.env.PORT || '3001';
process.env.HOST = process.env.HOST || 'localhost';

// グローバルなテストタイムアウト設定
jest.setTimeout(10000);

// コンソールログを抑制（テスト実行時のノイズを減らす）
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 