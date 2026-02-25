const { test, expect } = require('@playwright/test');

// 工单管理系统 E2E 测试 - 完整流程

test.describe('工单管理系统完整业务流程', () => {
  let testTicketId;

  test.beforeEach(async ({ page }) => {
    // 启动应用
    await page.goto('http://localhost:3000');
    
    // 登录（假设开发环境已配置）
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/tickets');
  });

  test('1. 创建高优先级工单', async ({ page }) => {
    await page.click('button:has-text("新建工单")');
    
    await page.fill('input[name="title"]', '测试工单 - 高优先级');
    await page.fill('textarea[name="description"]', '这是一个用于自动化测试的高优先级工单');
    
    await page.selectOption('select[name="priority"]', 'high');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/tickets');
    
    // 获取新创建的工单ID
    const ticketItems = await page.locator('.ticket-item').elementHandles();
    const newTicket = ticketItems[0];
    const ticketText = await newTicket.textContent();
    const idMatch = ticketText.match(/TG-(\d+)/);
    if (idMatch) {
      testTicketId = idMatch[1];
    }
    
    await expect(page.locator('.ticket-item').first()).toContainText('测试工单');
    await expect(page.locator('.ticket-priority').first()).toContainText('高');
  });

  test('2. 分配工单给处理人', async ({ page }) => {
    // 找到刚才创建的工单
    await page.click(`.ticket-item:has-text("TG-${testTicketId}")`);
    
    await page.click('button:has-text("分配")');
    await page.fill('input.search-user', '处理人');
    await page.click('div.user-option:has-text("处理人")');
    await page.click('button:has-text("确认")');
    
    await page.waitForTimeout(1000);
    await expect(page.locator('.ticket-status')).toContainText('处理中');
  });

  test('3. 处理工单并提交解决方案', async ({ page }) => {
    await page.click(`.ticket-item:has-text("TG-${testTicketId}")`);
    
    await page.click('button:has-text("提交解决方案")');
    await page.fill('textarea[name="solution"]', '问题已修复，请刷新页面');
    await page.click('button:has-text("提交")');
    
    await page.waitForTimeout(1000);
    await expect(page.locator('.ticket-status')).toContainText('待确认');
  });

  test('4. 确认解决方案并关闭工单', async ({ page }) => {
    await page.click(`.ticket-item:has-text("TG-${testTicketId}")`);
    
    await page.click('button:has-text("确认解决")');
    
    await page.waitForTimeout(1000);
    await expect(page.locator('.ticket-status')).toContainText('已关闭');
  });

  test('5. 查询和归档已关闭工单', async ({ page }) => {
    await page.click('nav >> text="归档"');
    
    await page.waitForSelector('.archive-filter');
    await page.selectOption('.archive-filter select[name="date"]', 'week');
    
    await expect(page.locator('.archive-ticket')).toContainText(`TG-${testTicketId}`);
  });
});