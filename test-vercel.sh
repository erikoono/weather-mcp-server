#!/bin/bash

# Vercelデプロイの動作確認スクリプト
# 使用方法: ./test-vercel.sh YOUR_VERCEL_URL

VERCEL_URL=${1:-"https://your-project-name.vercel.app"}

echo "🌤️ Vercelデプロイの動作確認を開始します..."
echo "URL: $VERCEL_URL"
echo ""

# 1. サーバー情報の確認
echo "📋 1. サーバー情報の確認"
curl -s "$VERCEL_URL/" | python3 -m json.tool
echo ""

# 2. 東京の現在の天気
echo "🌤️ 2. 東京の現在の天気"
curl -s "$VERCEL_URL/weather/Tokyo" | python3 -m json.tool
echo ""

# 3. 大阪の現在の天気
echo "🌤️ 3. 大阪の現在の天気"
curl -s "$VERCEL_URL/weather/Osaka" | python3 -m json.tool
echo ""

# 4. 東京の天気予報
echo "🔮 4. 東京の天気予報"
curl -s "$VERCEL_URL/weather/Tokyo/forecast" | python3 -m json.tool
echo ""

# 5. エラーハンドリングの確認
echo "❌ 5. エラーハンドリングの確認（存在しない都市）"
curl -s "$VERCEL_URL/weather/NonExistentCity" | python3 -m json.tool
echo ""

echo "✅ 動作確認完了！" 