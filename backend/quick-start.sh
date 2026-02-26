#!/bin/bash

# 快速启动脚本用于验证 SQLite 配置

echo "🧪 快速启动后端服务进行测试..."

# 检查是否已经有运行中的服务
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3000 已经被占用，正在停止现有服务..."
    pkill -f "node.*dist/main" || true
    sleep 2
fi

# 构建并启动服务
echo "🔨 正在构建后端..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败！"
    exit 1
fi

echo "🚀 正在启动后端服务..."
npm run start &
BACKEND_PID=$!

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务是否启动成功
if curl -s "http://localhost:3000/health" > /dev/null; then
    echo "✅ 后端服务启动成功！"
else
    echo "❌ 后端服务启动失败！"
    kill $BACKEND_PID
    exit 1
fi

# 测试 API 端点
echo "📡 测试 API 端点..."

# 检查健康检查端点
HEALTH=$(curl -s "http://localhost:3000/health")
echo "健康检查响应: $HEALTH"

# 测试用户注册和登录
echo "🔐 测试用户注册和登录..."
REGISTER=$(curl -s -X POST "http://localhost:3000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password",
    "name": "测试用户",
    "email": "test@example.com"
  }')

echo "用户注册响应: $REGISTER"

LOGIN=$(curl -s -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password"
  }')

echo "用户登录响应: $LOGIN"

# 提取 token
TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ 登录成功，Token 获取成功！"
else
    echo "❌ 登录失败！"
fi

echo "🎉 测试完成！"
echo
echo "📊 服务状态:"
echo "   PID: $BACKEND_PID"
echo "   端口: 3000"
echo "   数据库类型: $(grep -o '"type":"[^"]*' .env | cut -d'"' -f4 || echo "未配置")"

echo
echo "📋 使用说明:"
echo "  1. 查看所有接口文档: http://localhost:3000/api"
echo "  2. 停止服务: kill $BACKEND_PID"
echo "  3. 重置数据库: rm -f *.sqlite