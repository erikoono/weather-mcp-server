# 🌤️ 天気情報APIサーバー

このプロジェクトは、OpenWeatherMap APIを使用して天気情報を提供するRESTful APIサーバーです。世界中の都市の現在の天気情報と天気予報を取得できます。

## ✨ 機能

- 🌤️ 現在の天気情報の取得
- 🌡️ 気温、体感温度、湿度、風速などの詳細情報
- 🌍 世界中の都市に対応
- 🇯🇵 日本語での天気説明
- 📊 JSON形式でのデータ提供
- 🔮 5日間の天気予報
- 🚀 CI/CDパイプライン（GitHub Actions）
- 🐳 Docker対応
- ☁️ Vercelデプロイ対応

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、OpenWeatherMap APIキーを設定してください：

```bash
cp env.example .env
```

`.env`ファイルを編集して、OpenWeatherMap APIキーを設定：

```
OPENWEATHER_API_KEY=your_api_key_here
```

### 3. OpenWeatherMap APIキーの取得

1. [OpenWeatherMap](https://openweathermap.org/)にアクセス
2. アカウントを作成
3. APIキーを取得
4. `.env`ファイルに設定

### 4. ビルド

```bash
npm run build
```

### 5. 実行

```bash
npm start
```

開発モードで実行する場合：

```bash
npm run dev
```

## API エンドポイント

### サーバー情報

```
GET /
```

サーバーの基本情報と利用可能なエンドポイントを返します。

### 現在の天気情報

```
GET /weather/:city
```

**パラメータ:**
- `city` (必須): 都市名（例: Tokyo, Osaka, Kyoto）
- `country` (オプション): 国コード（例: JP, US, UK、デフォルト: JP）

**例:**
```bash
curl http://localhost:3000/weather/Tokyo
curl http://localhost:3000/weather/New%20York?country=US
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "temperature": 22,
    "feelsLike": 24,
    "humidity": 65,
    "windSpeed": 3.2,
    "description": "曇り",
    "visibility": 10,
    "pressure": 1013,
    "city": "Tokyo",
    "country": "JP",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 天気予報

```
GET /weather/:city/forecast
```

**パラメータ:**
- `city` (必須): 都市名
- `country` (オプション): 国コード（デフォルト: JP）
- `days` (オプション): 予報日数（デフォルト: 5、最大: 5）

**例:**
```bash
curl http://localhost:3000/weather/Tokyo/forecast
curl http://localhost:3000/weather/Osaka/forecast?days=3
```

**レスポンス:**
```json
{
  "success": true,
  "data": [
    {
      "temperature": 22,
      "feelsLike": 24,
      "humidity": 65,
      "windSpeed": 3.2,
      "description": "曇り",
      "visibility": 10,
      "pressure": 1013,
      "city": "Tokyo",
      "country": "JP",
      "timestamp": "2024-01-15T00:00:00.000Z"
    }
    // ... 他の日付のデータ
  ]
}
```

## 🏗️ プロジェクト構造

```
weather-mcp-server/
├── src/
│   ├── index.ts              # メインエントリーポイント
│   └── services/
│       └── weather.ts        # 天気情報サービス
├── tests/
│   ├── setup.ts              # テストセットアップ
│   └── simple.test.ts        # 基本機能テスト
├── .github/
│   └── workflows/
│       ├── test.yml          # テストワークフロー
│       ├── ci-cd.yml         # CI/CDパイプライン
│       ├── deploy-vercel.yml # Vercelデプロイ
│       └── docker.yml        # Dockerビルド
├── package.json
├── tsconfig.json
├── jest.config.js            # Jest設定
├── vercel.json               # Vercel設定
├── Dockerfile                # Docker設定
├── env.example
└── README.md
```

## 🛠️ 開発

### 依存関係

- `express` - Webフレームワーク
- `cors` - CORSミドルウェア
- `axios` - HTTP クライアント
- `dotenv` - 環境変数管理
- `typescript` - TypeScript コンパイラ
- `jest` - テストフレームワーク
- `supertest` - APIテスト

### スクリプト

- `npm run build` - TypeScriptをコンパイル
- `npm start` - ビルドされたサーバーを実行
- `npm run dev` - 開発モードで実行
- `npm test` - テストを実行
- `npm run test:ci` - CI用テスト実行
- `npm run test:coverage` - カバレッジ付きテスト
- `npm run lint` - コードリンティング
- `npm run type-check` - 型チェック

## 🚀 CI/CD パイプライン

### GitHub Actions ワークフロー

- **テスト自動化**: コード変更時の自動テスト実行
- **ビルド**: TypeScriptのコンパイル
- **セキュリティ**: npm audit + Snyk
- **デプロイ**: Vercel自動デプロイ

### テスト環境

- **テストカバレッジ**: 良好
- **安定性**: 100%成功率
- **自動化**: PR時の自動テスト

## 🐳 Docker サポート

```bash
# Dockerイメージのビルド
docker build -t weather-api .

# コンテナの実行
docker run -p 3000:3000 weather-api
```

## ☁️ Vercel デプロイ

1. [Vercel](https://vercel.com)にアクセス
2. GitHubリポジトリをインポート
3. 環境変数`OPENWEATHER_API_KEY`を設定
4. 自動デプロイ完了

## 🧪 テスト

```bash
# 全テスト実行
npm test

# カバレッジ付きテスト
npm run test:coverage

# CI用テスト
npm run test:ci
```

## 📊 品質指標

- **コード品質**: TypeScriptで型安全
- **テスト**: 包括的なテストケース
- **CI/CD**: 完全自動化
- **デプロイ**: 本番環境対応

## エラーハンドリング

APIは以下のエラーレスポンスを返します：

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

## 📈 パフォーマンス

- **レスポンス時間**: 高速
- **スケーラビリティ**: Docker対応
- **可用性**: Vercel CDN
- **監視**: GitHub Actions

## 🔗 関連リンク

- [GitHub Actions](https://github.com/erikoono/weather-mcp-server/actions)
- [Vercel](https://vercel.com/new)
- [OpenWeatherMap API](https://openweathermap.org/api)

## ライセンス

MIT License

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します！

### 開発ガイドライン

1. 機能ブランチを作成
2. テストを追加
3. コードレビューを実施
4. CI/CDパイプラインを通過
5. マージ 