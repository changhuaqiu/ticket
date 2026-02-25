const { test, expect } = require('@playwright/test');

// 工单管理系统 - E2E 测试

test.describe('工单系统核心功能', () => {
  
  test.beforeEach(async ({ page }) => {
    // 登录（待实现）
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('创建工单流程', async ({ page }) => {
    // 导航到新建工单页面
    await page.goto('/tickets/new');
    
    // 填写工单信息
    await page.fill('input[name="title"]', '测试工单标题');
    await page.fill('textarea[name="description"]', '这是一个测试工单的详细描述');
    await page.selectOption('select[name="priority"]', 'high');
    
    // 提交工单
    await page.click('button[type="submit"]');
    
    // 验证工单创建成功
    await expect(page.locator('.ticket-list')).toContainText('测试工单标题');
    await expect(page.locator('.ticket-status')).toContainText('新建');
  });

  test('工单状态流转', async ({ page }) => {
    // 假设已存在一个新建状态的工单
    await page.goto('/tickets');
    
    // 点击第一个工单
    await page.click('.ticket-item:first-child');
    
    // 分配处理人并提交到处理中
    await page.click('button.assign-to');
    await page.fill('input.search-user', '处理人');
    await page.click('div.user-option:first-child');
    await page.click('button.confirm-assign');
    
    // 验证状态变更
    await expect(page.locator('.ticket-status')).toContainText('处理中');
  });

  test('角色权限隔离验证', async ({ page }) => {
    // 模拟不同角色登录（需要权限管理系统支持）
    await page.goto('/admin');
    
    // 检查权限菜单是否可见（根据角色判断）
    const hasAdminMenu = await page.isVisible('nav.admin-menu');
    expect(hasAdminMenu).toBe(false); // 普通用户不应看到管理员菜单
  });

  test('SLA时效显示', async ({ page }) => {
    await page.goto('/tickets');
    
    // 检查高优先级工单的SLA
    const highPriorityTicket = page.locator('.ticket-item').filter({ hasText: '高' }).first();
    await highPriorityTicket.click();
    
    const slaText = await page.locator('.sla-timer').textContent();
    expect(slaText).toBeTruthy();
    expect(slaText).not.toContain('已超'); // 验证未超时
  });
});