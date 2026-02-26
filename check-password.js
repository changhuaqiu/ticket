const bcrypt = require('bcrypt');

// 测试密码验证
const testPassword = async (password) => {
  // 数据库中的加密密码
  const dbPassword = '$2b$10$example';
  
  try {
    const isMatch = await bcrypt.compare(password, dbPassword);
    console.log(`密码验证结果: ${isMatch}`);
    
    // 生成新的加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`新的加密密码: ${hashedPassword}`);
  } catch (error) {
    console.error('密码验证错误:', error);
  }
};

// 测试默认密码
testPassword('admin123');
