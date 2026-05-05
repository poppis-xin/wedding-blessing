const express = require('express');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8888;
const DB_FILE = path.join(__dirname, 'blessings.db');

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// write 路由
app.get('/write', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'write.html'));
});

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const buffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS blessings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      time TEXT NOT NULL,
      likes INTEGER DEFAULT 0
    )
  `);
  saveDB();
}

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

// 获取祝福（支持分页 + 增量）
app.get('/api/blessings', (req, res) => {
  const since = parseInt(req.query.since) || 0;
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const offset = parseInt(req.query.offset) || 0;

  const totalRow = db.exec('SELECT COUNT(*) as count FROM blessings');
  const total = totalRow[0]?.values[0][0] || 0;

  if (since > 0) {
    const stmt = db.prepare('SELECT * FROM blessings WHERE id > ? ORDER BY id ASC');
    stmt.bind([since]);
    const blessings = [];
    while (stmt.step()) {
      blessings.push(stmt.getAsObject());
    }
    stmt.free();
    return res.json({ total, blessings });
  }

  const stmt = db.prepare('SELECT * FROM blessings ORDER BY id DESC LIMIT ? OFFSET ?');
  stmt.bind([limit, offset]);
  const blessings = [];
  while (stmt.step()) {
    blessings.push(stmt.getAsObject());
  }
  stmt.free();

  res.json({ total, offset, blessings });
});

// 提交祝福
app.post('/api/blessings', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: '名字和祝福语不能为空哦~' });
  }
  if (name.length > 20) {
    return res.status(400).json({ error: '名字太长啦，20字以内~' });
  }
  if (message.length > 200) {
    return res.status(400).json({ error: '祝福语太长啦，200字以内~' });
  }

  const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  db.run('INSERT INTO blessings (name, message, time, likes) VALUES (?, ?, ?, 0)', [
    name.trim(), message.trim(), time
  ]);

  const idRow = db.exec('SELECT last_insert_rowid()');
  const id = idRow[0]?.values[0][0];
  saveDB();

  res.json({ success: true, blessing: { id, name: name.trim(), message: message.trim(), time, likes: 0 } });
});

// 点赞
app.post('/api/blessings/:id/like', (req, res) => {
  const id = parseInt(req.params.id);
  db.run('UPDATE blessings SET likes = likes + 1 WHERE id = ?', [id]);
  const row = db.exec('SELECT likes FROM blessings WHERE id = ?', [id]);
  const likes = row[0]?.values[0][0] || 0;
  saveDB();
  res.json({ success: true, likes });
});

// 管理员删除
app.delete('/api/blessings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.run('DELETE FROM blessings WHERE id = ?', [id]);
  saveDB();
  res.json({ success: true });
});

// 全部清空
app.delete('/api/blessings', (req, res) => {
  db.run('DELETE FROM blessings');
  saveDB();
  res.json({ success: true });
});

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎉 祝福墙服务已启动: http://0.0.0.0:${PORT}`);
    console.log(`📱 扫码写祝福: http://你的IP:${PORT}/write`);
    console.log(`🖥️  大屏展示: http://你的IP:${PORT}`);
  });
}).catch(err => {
  console.error('数据库初始化失败:', err);
  process.exit(1);
});
