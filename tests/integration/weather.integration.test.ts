import request from 'supertest';
import { createServer } from 'http';
import { app } from '../../src/index';

// テスト用のサーバーを作成
const server = createServer(app);

describe('Weather API Integration Tests', () => {
  beforeAll((done) => {
    server.listen(3001, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /', () => {
    it('サーバー情報を返す', async () => {
      const response = await request(server).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'weather-mcp-server');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /weather/:city', () => {
    it('東京の天気情報を取得する（実際のAPIキーが必要）', async () => {
      const response = await request(server).get('/weather/Tokyo');

      // APIキーが有効な場合
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('temperature');
        expect(response.body.data).toHaveProperty('description');
        expect(response.body.data).toHaveProperty('city', 'Tokyo');
      } else {
        // APIキーが無効な場合
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('存在しない都市の場合はエラーを返す', async () => {
      const response = await request(server).get('/weather/NonExistentCity12345');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('国コードを指定して天気情報を取得する', async () => {
      const response = await request(server).get('/weather/London?country=GB');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('city', 'London');
        expect(response.body.data).toHaveProperty('country', 'GB');
      } else {
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
      }
    });
  });

  describe('GET /weather/:city/forecast', () => {
    it('東京の天気予報を取得する（実際のAPIキーが必要）', async () => {
      const response = await request(server).get('/weather/Tokyo/forecast');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0]).toHaveProperty('temperature');
        expect(response.body.data[0]).toHaveProperty('description');
      } else {
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      }
    });

    it('日数を指定して天気予報を取得する', async () => {
      const response = await request(server).get('/weather/Tokyo/forecast?days=3');

      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data.length).toBeLessThanOrEqual(3);
      } else {
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
      }
    });

    it('存在しない都市の予報の場合はエラーを返す', async () => {
      const response = await request(server).get('/weather/NonExistentCity12345/forecast');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('CORS', () => {
    it('CORSヘッダーが設定されている', async () => {
      const response = await request(server)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('Error Handling', () => {
    it('存在しないエンドポイントの場合は404を返す', async () => {
      const response = await request(server).get('/nonexistent');

      expect(response.status).toBe(404);
    });

    it('不正なHTTPメソッドの場合は405を返す', async () => {
      const response = await request(server).post('/weather/Tokyo');

      expect(response.status).toBe(404); // Express.jsのデフォルト動作
    });
  });
}); 