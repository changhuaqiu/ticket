# 工单管理系统 - API 接口规范

## 基础信息

- **Base URL**: `/api/v1`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

---

## 1. 认证接口

### 1.1 登录
```
POST /auth/login
```

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "token": "string",
    "user": {
      "id": "uuid",
      "username": "string",
      "name": "string",
      "role": "string"
    }
  }
}
```

### 1.2 获取当前用户
```
GET /auth/me
```

---

## 2. 工单接口

### 2.1 获取工单列表
```
GET /tickets
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态筛选 |
| priority | string | 优先级筛选 |
| keyword | string | 关键词搜索 |
| page | number | 页码 |
| pageSize | number | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "uuid",
        "ticketNo": "TK-20260226-0001",
        "title": "string",
        "status": "new",
        "priority": "high",
        "slaDueAt": "2026-02-26T12:00:00Z",
        "submitter": { "id": "uuid", "name": "string" },
        "handler": { "id": "uuid", "name": "string" },
        "createdAt": "2026-02-26T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 2.2 获取工单详情
```
GET /tickets/:id
```

### 2.3 创建工单
```
POST /tickets
```

**请求体**:
```json
{
  "title": "string",
  "description": "string",
  "category": "complaint",
  "priority": "high",
  "attachments": ["file_id_1", "file_id_2"]
}
```

### 2.4 更新工单状态
```
PUT /tickets/:id/status
```

**请求体**:
```json
{
  "status": "processing",
  "remark": "string"
}
```

### 2.5 分配处理人
```
PUT /tickets/:id/assign
```

**请求体**:
```json
{
  "handlerId": "uuid"
}
```

---

## 3. 评论接口

### 3.1 获取评论列表
```
GET /tickets/:ticketId/comments
```

### 3.2 添加评论
```
POST /tickets/:ticketId/comments
```

**请求体**:
```json
{
  "content": "string"
}
```

---

## 4. 附件接口

### 4.1 上传附件
```
POST /upload
Content-Type: multipart/form-data
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "url": "string",
    "filename": "string"
  }
}
```

---

## 5. 统计接口

### 5.1 获取统计数据
```
GET /statistics
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "total": 128,
    "byStatus": {
      "new": 23,
      "processing": 45,
      "confirming": 12,
      "closed": 48
    },
    "slaOverdue": 5,
    "avgResponseTime": "2h 30m"
  }
}
```

---

## 6. 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未授权 |
| 1003 | 禁止访问 |
| 1004 | 资源不存在 |
| 2001 | 工单不存在 |
| 2002 | 状态转换无效 |
| 2003 | SLA 已超时 |
| 3001 | 用户名已存在 |
| 3002 | 密码错误 |
