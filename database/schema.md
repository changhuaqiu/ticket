# 工单管理系统 - 数据库设计

## 1. 表结构

### 1.1 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | VARCHAR(50) | 用户名 |
| password | VARCHAR(255) | 密码哈希 |
| name | VARCHAR(100) | 姓名 |
| email | VARCHAR(100) | 邮箱 |
| role | ENUM | 角色: submitter, handler, supervisor, admin |
| department | VARCHAR(100) | 部门 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 1.2 工单表 (tickets)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| ticket_no | VARCHAR(20) | 工单编号 (TK-YYYYMMDD-XXXX) |
| title | VARCHAR(200) | 标题 |
| description | TEXT | 描述 |
| category | ENUM | 类别: complaint, inquiry, suggestion, other |
| priority | ENUM | 优先级: urgent, high, medium, low |
| status | ENUM | 状态: new, processing, confirming, closed |
| submitter_id | UUID | 提交人 ID |
| handler_id | UUID | 处理人 ID |
| sla_due_at | TIMESTAMP | SLA 截止时间 |
| resolved_at | TIMESTAMP | 解决时间 |
| closed_at | TIMESTAMP | 关闭时间 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 1.3 工单评论表 (ticket_comments)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| ticket_id | UUID | 工单 ID |
| user_id | UUID | 用户 ID |
| content | TEXT | 评论内容 |
| created_at | TIMESTAMP | 创建时间 |

### 1.4 工单流转记录表 (ticket_histories)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| ticket_id | UUID | 工单 ID |
| action | VARCHAR(50) | 操作类型 |
| from_status | ENUM | 原状态 |
| to_status | ENUM | 新状态 |
| operator_id | UUID | 操作人 ID |
| remark | TEXT | 备注 |
| created_at | TIMESTAMP | 创建时间 |

### 1.5 附件表 (attachments)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| ticket_id | UUID | 工单 ID |
| filename | VARCHAR(255) | 文件名 |
| filepath | VARCHAR(500) | 文件路径 |
| filesize | INTEGER | 文件大小 |
| uploader_id | UUID | 上传人 ID |
| created_at | TIMESTAMP | 创建时间 |

---

## 2. 索引

```sql
-- 工单表索引
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_submitter ON tickets(submitter_id);
CREATE INDEX idx_tickets_handler ON tickets(handler_id);
CREATE INDEX idx_tickets_sla_due ON tickets(sla_due_at);
CREATE INDEX idx_tickets_created ON tickets(created_at);

-- 评论表索引
CREATE INDEX idx_comments_ticket ON ticket_comments(ticket_id);

-- 流转记录索引
CREATE INDEX idx_histories_ticket ON ticket_histories(ticket_id);
```

---

## 3. SLA 规则配置

| 优先级 | 响应时限 | 解决时限 |
|--------|----------|----------|
| urgent | 30 分钟 | 2 小时 |
| high | 1 小时 | 4 小时 |
| medium | 2 小时 | 8 小时 |
| low | 4 小时 | 24 小时 |
