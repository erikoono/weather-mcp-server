# マルチステージビルド
FROM node:18-alpine AS builder

WORKDIR /app

# 依存関係をコピー（devDependenciesも含む）
COPY package*.json ./
RUN npm ci

# 設定ファイルをコピー
COPY tsconfig.json ./

# ソースコードをコピー
COPY src/ ./src/

# TypeScriptをビルド
RUN npm run build

# 本番環境用イメージ
FROM node:18-alpine AS production

WORKDIR /app

# 本番用依存関係のみをコピー
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ビルドされたファイルをコピー
COPY --from=builder /app/dist ./dist

# 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# ファイルの所有者を変更
RUN chown -R nodejs:nodejs /app
USER nodejs

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# ポートを公開
EXPOSE 3000

# 環境変数
ENV NODE_ENV=production
ENV PORT=3000

# アプリケーションを起動
CMD ["node", "dist/index.js"] 