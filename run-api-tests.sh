#!/bin/bash

# API 接口测试脚本 - 简化版

BASE_URL="http://localhost:3000"
AUTH_TOKEN=""

echo "🚀 开始 API 接口测试..."

# 1. 健康检查接口
echo -e "\n1. 健康检查接口 (GET /api/v1/health)"
HEALTH_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/health")

if [ $? -eq 0 ]; then
  STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  if [ "$STATUS" = "healthy" ]; then
    echo "✅ 健康检查接口测试通过"
  else
    echo "❌ 健康检查接口测试失败 - 状态不是 healthy"
  fi
else
  echo "❌ 健康检查接口测试失败 - 请求失败"
fi

# 2. API 文档接口
echo -e "\n2. API 文档接口 (GET /api/docs)"
API_DOCS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/docs")

if [ $? -eq 0 ]; then
  if [ "$API_DOCS_RESPONSE" -eq 200 ]; then
    echo "✅ API 文档接口测试通过"
  else
    echo "❌ API 文档接口测试失败 - 状态码 $API_DOCS_RESPONSE"
  fi
else
  echo "❌ API 文档接口测试失败 - 请求失败"
fi

# 3. 用户登录
echo -e "\n3. 用户登录接口 (POST /api/v1/auth/login)"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

if [ $? -eq 0 ]; then
  CODE=$(echo "$LOGIN_RESPONSE" | grep -o '"code":[0-9]*' | cut -d':' -f2)
  if [ "$CODE" -eq 0 ]; then
    AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ 用户登录接口测试通过"
    echo "   Token 获取成功: ${AUTH_TOKEN:0:20}..."
  else
    echo "❌ 用户登录接口测试失败 - 错误码: $CODE"
    echo "   响应: $LOGIN_RESPONSE"
  fi
else
  echo "❌ 用户登录接口测试失败 - 请求失败"
fi

# 4. 创建工单接口
if [ -n "$AUTH_TOKEN" ]; then
  echo -e "\n4. 创建工单接口 (POST /api/v1/tickets)"
  CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/tickets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "title": "API 测试工单",
      "description": "这是一个通过 API 测试创建的工单",
      "category": "complaint",
      "priority": "urgent"
    }')

  if [ $? -eq 0 ]; then
    CODE=$(echo "$CREATE_RESPONSE" | grep -o '"code":[0-9]*' | cut -d':' -f2)
    if [ "$CODE" -eq 0 ]; then
      TEST_TICKET_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
      TEST_TICKET_NO=$(echo "$CREATE_RESPONSE" | grep -o '"ticketNo":"[^"]*"' | cut -d'"' -f4)
      echo "✅ 工单创建接口测试通过"
      echo "   工单ID: $TEST_TICKET_ID"
      echo "   工单号: $TEST_TICKET_NO"
    else
      echo "❌ 工单创建接口测试失败 - 错误码: $CODE"
      echo "   响应: $CREATE_RESPONSE"
    fi
  else
    echo "❌ 工单创建接口测试失败 - 请求失败"
  fi
else
  echo "4. 跳过创建工单接口测试 - 未获取到 token"
fi

# 5. 获取工单列表接口
if [ -n "$AUTH_TOKEN" ]; then
  echo -e "\n5. 获取工单列表接口 (GET /api/v1/tickets)"
  GET_TICKETS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/tickets" \
    -H "Authorization: Bearer $AUTH_TOKEN")

  if [ $? -eq 0 ]; then
    CODE=$(echo "$GET_TICKETS_RESPONSE" | grep -o '"code":[0-9]*' | cut -d':' -f2)
    if [ "$CODE" -eq 0 ]; then
      COUNT=$(echo "$GET_TICKETS_RESPONSE" | grep -o '"list":\[[^]]*\]' | grep -o '{[^}]*}' | wc -l)
      echo "✅ 工单列表接口测试通过 - 共 $COUNT 个工单"
    else
      echo "❌ 工单列表接口测试失败 - 错误码: $CODE"
    fi
  else
    echo "❌ 工单列表接口测试失败 - 请求失败"
  fi
else
  echo "5. 跳过获取工单列表接口测试 - 未获取到 token"
fi

# 6. 获取单个工单接口
if [ -n "$AUTH_TOKEN" ] && [ -n "$TEST_TICKET_ID" ]; then
  echo -e "\n6. 获取单个工单接口 (GET /api/v1/tickets/$TEST_TICKET_ID)"
  GET_TICKET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/tickets/$TEST_TICKET_ID" \
    -H "Authorization: Bearer $AUTH_TOKEN")

  if [ $? -eq 0 ]; then
    CODE=$(echo "$GET_TICKET_RESPONSE" | grep -o '"code":[0-9]*' | cut -d':' -f2)
    if [ "$CODE" -eq 0 ]; then
      TITLE=$(echo "$GET_TICKET_RESPONSE" | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
      echo "✅ 单个工单接口测试通过"
      echo "   工单标题: $TITLE"
    else
      echo "❌ 单个工单接口测试失败 - 错误码: $CODE"
    fi
  else
    echo "❌ 单个工单接口测试失败 - 请求失败"
  fi
else
  echo "6. 跳过获取单个工单接口测试 - 未创建测试工单或未获取到 token"
fi

# 7. 更新工单状态接口
if [ -n "$AUTH_TOKEN" ] && [ -n "$TEST_TICKET_ID" ]; then
  echo -e "\n7. 更新工单状态接口 (PUT /api/v1/tickets/$TEST_TICKET_ID/status)"
  UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/v1/tickets/$TEST_TICKET_ID/status" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{"status": "processing"}')

  if [ $? -eq 0 ]; then
    CODE=$(echo "$UPDATE_RESPONSE" | grep -o '"code":[0-9]*' | cut -d':' -f2)
    if [ "$CODE" -eq 0 ]; then
      NEW_STATUS=$(echo "$UPDATE_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
      echo "✅ 工单状态更新接口测试通过"
      echo "   新状态: $NEW_STATUS"
    else
      echo "❌ 工单状态更新接口测试失败 - 错误码: $CODE"
      echo "   响应: $UPDATE_RESPONSE"
    fi
  else
    echo "❌ 工单状态更新接口测试失败 - 请求失败"
  fi
else
  echo "7. 跳过工单状态更新接口测试 - 未创建测试工单或未获取到 token"
fi

echo -e "\n✅ API 接口测试完成!"
