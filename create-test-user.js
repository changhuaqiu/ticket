const bcrypt = require('bcrypt');
const { exec } = require('child_process');

const createTestUser = async () => {
  const username = 'admin';
  const password = 'admin123';
  const name = '管理员';
  const email = 'admin@example.com';
  const role = 'admin';
  const department = 'IT部';

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO users (username, password, name, email, role, department) VALUES 
    ('${username}', '${hashedPassword}', '${name}', '${email}', '${role}', '${department}')
    ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password;`;

  const command = `psql -U yourusername -d yourdatabase -c "${sql}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('执行 SQL 命令时出错:', error);
      return;
    }

    if (stderr) {
      console.error('SQL 执行错误:', stderr);
    }

    console.log('测试用户创建/更新成功:', stdout);
  });
};

createTestUser();
