const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./backend/ticket_system_dev');

const username = 'admin';
const password = 'admin123';
const name = '管理员';
const email = 'admin@example.com';
const role = 'admin';
const department = 'IT部';

const insertAdminUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    console.log('加密后的密码:', hashedPassword);
    console.log('生成的 ID:', id);

    // 插入用户
    db.run(
      `INSERT INTO users (id, username, password, name, email, role, department) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, username, hashedPassword, name, email, role, department],
      function(err) {
        if (err) {
          console.error('插入用户时出错:', err.message);
        } else {
          console.log(`成功插入用户 ${username}`);
        }
      }
    );
  } catch (err) {
    console.error('加密密码时出错:', err);
  } finally {
    db.close();
  }
};

insertAdminUser();
