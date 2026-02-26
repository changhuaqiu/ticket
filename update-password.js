const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./backend/ticket_system_dev');

const username = 'admin';
const password = 'admin123';

const updatePassword = async () => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('加密后的密码:', hashedPassword);

    // 更新密码
    db.run(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, username],
      function(err) {
        if (err) {
          console.error('更新密码时出错:', err.message);
        } else {
          if (this.changes > 0) {
            console.log(`成功更新用户 ${username} 的密码`);
          } else {
            console.log(`未找到用户 ${username}`);
          }
        }
      }
    );
  } catch (err) {
    console.error('加密密码时出错:', err);
  } finally {
    db.close();
  }
};

updatePassword();
