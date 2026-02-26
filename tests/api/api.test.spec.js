const { test, expect } = require('@playwright/test');

// API 测试 - 直接测试后端接口
test.describe('API 接口测试', () => {
  // 基础 URL
  const baseUrl = 'http://localhost:3000';

  test('1. 健康检查接口', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/v1/health`);
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeGreaterThan(0);
  });

  test('2. API 文档接口', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/docs`);
    expect(response.status()).toBe(200);
    
    const body = await response.text();
    expect(body).toContain('Swagger UI');
  });

  test('3. 创建工单接口', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/v1/tickets`, {
      data: {
        title: 'API 测试工单',
        description: '这是一个通过 API 测试创建的工单',
        category: 'complaint',
        priority: 'urgent'
      }
    });
    
    expect(response.status()).toBe(201);
    
    const body = await response.json();
    expect(body.code).toBe(0);
    expect(body.data).toBeDefined();
    expect(body.data.title).toBe('API 测试工单');
    expect(body.data.status).toBe('new');
    expect(body.data.ticketNo).toBeDefined();
    
    // 保存工单ID用于后续测试
    test['testTicketId'] = body.data.id;
    test['testTicketNo'] = body.data.ticketNo;
  });

  test('4. 获取工单列表接口', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/v1/tickets`);
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.code).toBe(0);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('5. 获取单个工单接口', async ({ request }) => {
    // 确保我们有一个测试工单ID
    if (!test['testTicketId']) {
      test.skip('需要先创建工单');
    }
    
    const response = await request.get(`${baseUrl}/api/v1/tickets/${test['testTicketId']}`);
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.code).toBe(0);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(test['testTicketId']);
    expect(body.data.title).toContain('API 测试工单');
  });

  test('6. 更新工单状态接口', async ({ request }) => {
    // 确保我们有一个测试工单ID
    if (!test['testTicketId']) {
      test.skip('需要先创建工单');
    }
    
    const response = await request.patch(`${baseUrl}/api/v1/tickets/${test['testTicketId']}/status`, {
      data: {
        status: 'processing'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.code).toBe(0);
    expect(body.data).toBeDefined();
    expect(body.data.status).toBe('processing');
  });
});
