-- 工单管理系统数据库初始化脚本
-- 数据库: PostgreSQL

-- 创建枚举类型
CREATE TYPE user_role AS ENUM ('submitter', 'handler', 'supervisor', 'admin');
CREATE TYPE ticket_category AS ENUM ('complaint', 'inquiry', 'suggestion', 'other');
CREATE TYPE ticket_priority AS ENUM ('urgent', 'high', 'medium', 'low');
CREATE TYPE ticket_status AS ENUM ('new', 'processing', 'confirming', 'closed');

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role user_role NOT NULL DEFAULT 'submitter',
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工单表
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_no VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ticket_category DEFAULT 'other',
    priority ticket_priority DEFAULT 'medium',
    status ticket_status DEFAULT 'new',
    submitter_id UUID NOT NULL REFERENCES users(id),
    handler_id UUID REFERENCES users(id),
    sla_due_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工单评论表
CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工单流转记录表
CREATE TABLE ticket_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    from_status ticket_status,
    to_status ticket_status,
    operator_id UUID NOT NULL REFERENCES users(id),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 附件表
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    filesize INTEGER,
    uploader_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_submitter ON tickets(submitter_id);
CREATE INDEX idx_tickets_handler ON tickets(handler_id);
CREATE INDEX idx_tickets_sla_due ON tickets(sla_due_at);
CREATE INDEX idx_tickets_created ON tickets(created_at);
CREATE INDEX idx_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX idx_histories_ticket ON ticket_histories(ticket_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为用户表添加触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 为工单表添加触发器
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 插入测试数据
INSERT INTO users (username, password, name, email, role, department) VALUES
('admin', '$2b$10$example', '管理员', 'admin@example.com', 'admin', 'IT部'),
('zhangsan', '$2b$10$example', '张三', 'zhangsan@example.com', 'submitter', '客服部'),
('lisi', '$2b$10$example', '李四', 'lisi@example.com', 'handler', '技术部'),
('wangwu', '$2b$10$example', '王五', 'wangwu@example.com', 'supervisor', '客服部');
