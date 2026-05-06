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

// 防刷机制：IP 限流
const ipSubmitMap = new Map(); // 存储 IP -> 最后提交时间
const RATE_LIMIT_MS = 60000; // 1分钟

function checkRateLimit(ip) {
  const now = Date.now();
  const lastSubmit = ipSubmitMap.get(ip);

  if (lastSubmit && (now - lastSubmit) < RATE_LIMIT_MS) {
    const waitSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastSubmit)) / 1000);
    return { allowed: false, waitSeconds };
  }

  ipSubmitMap.set(ip, now);
  return { allowed: true };
}

// 定期清理过期的 IP 记录（每10分钟）
setInterval(() => {
  const now = Date.now();
  for (const [ip, time] of ipSubmitMap.entries()) {
    if (now - time > RATE_LIMIT_MS * 2) {
      ipSubmitMap.delete(ip);
    }
  }
}, 600000);

// 敏感词过滤
const sensitiveWords = [
  '政治', '暴力', '色情', '赌博', '毒品', '法轮功', '六四',
  '习近平', '共产党', '台独', '藏独', '疆独', '反华',
  '操', '妈', '傻逼', '草泥马', '日你', '去死', '智障',
  '垃圾', '废物', '贱', '婊', '屎', '尿', '屁', '放屁'
];

function containsSensitiveWords(text) {
  const lowerText = text.toLowerCase();
  for (const word of sensitiveWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return true;
    }
  }
  return false;
}

// write 路由
app.get('/write', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'write.html'));
});

app.get('/welcome', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

app.get('/all-blessings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'all-blessings.html'));
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
  const requestedLimit = parseInt(req.query.limit);
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : null;
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

  const stmt = limit
    ? db.prepare('SELECT * FROM blessings ORDER BY id DESC LIMIT ? OFFSET ?')
    : db.prepare('SELECT * FROM blessings ORDER BY id DESC');
  if (limit) stmt.bind([limit, offset]);
  const blessings = [];
  while (stmt.step()) {
    blessings.push(stmt.getAsObject());
  }
  stmt.free();

  res.json({ total, offset, blessings });
});

// 提交祝福
app.post('/api/blessings', (req, res) => {
  // 获取真实 IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress;

  // 检查频率限制
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `提交太频繁啦，请等待 ${rateCheck.waitSeconds} 秒后再试~`
    });
  }

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

  // 敏感词检测
  if (containsSensitiveWords(name) || containsSensitiveWords(message)) {
    return res.status(400).json({ error: '内容包含不当词汇，请修改后重试~' });
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
