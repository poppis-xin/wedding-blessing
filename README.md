# 婚礼祝福墙 💕

为婚礼打造的互动祝福系统。大屏展示、移动端写祝福、实时飘动效果、防刷审核一体化。

## 功能特性

- **大屏实时展示** — 祝福卡片在屏幕上以流动动画飘动，营造浪漫视觉体验
- **多样式卡片** — 支持多种粉色系渐变样式，随机展示增加视觉层次感
- **智能去重显示** — 防止单个循环内祝福重复显示
- **完全响应式** — 适配手机、平板、桌面、4K 大屏等各种设备
- **移动端写祝福** — 简洁表单，手机扫码即可参与
- **实时内容更新** — 新祝福秒级推送到大屏显示
- **防刷限流** — 基于 IP 的防暴力提交机制
- **内容审核** — 自动敏感词检测，打造安全氛围

## 技术栈

- **前端** — 原生 HTML5/CSS3/JavaScript，无框架依赖
- **后端** — Node.js + Express
- **数据库** — SQLite（sql.js）
- **字体** — Google Fonts（Ma Shan Zheng, Noto Serif SC）

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
node server.js
```

服务运行在 `http://localhost:8888`

### 页面导航

| 页面 | 路径 | 用途 |
|------|------|------|
| **大屏展示** | `/` | 婚礼现场投影，展示所有祝福和实时飘动效果 |
| **写祝福** | `/write` | 宾客写祝福的表单，移动端优化 |
| **欢迎页** | `/welcome` | 活动欢迎页面 |
| **祝福汇总** | `/all-blessings` | 查看所有祝福的详情列表 |

## 核心功能说明

### 大屏展示页

主要特性：
- 自动轮播所有祝福
- 新祝福在 3 秒内自动推送显示
- 祝福卡片带有"赞"计数显示
- 支持 4K 分辨率显示

### 写祝福页

特点：
- 简洁移动优化设计
- 需要填写：名字、祝福内容
- 提交后即时显示在大屏
- 暗色主题设计，护眼舒适

### 安全与审核

**限流机制**：
- 同一 IP 地址 1 分钟内最多提交 1 条祝福
- 超限返回等待时间提示

**敏感词过滤**：
- 自动检测包括政治、暴力、色情等敏感内容
- 包含敏感词的祝福拒绝提交

## 自定义配置

### 修改新人信息

编辑 `public/index.html` 的顶部 `<style>` 后的 HTML 部分：

```html
<div class="names">新郎 & 新娘</div>
<div class="subtitle">永结同心 · 百年好合</div>
<div class="date">2026年5月12日</div>
```

### 调整动画参数

在 `public/index.html` 中找到 JavaScript 配置区域：

```javascript
let maxOnScreen = 8;                      // 同时显示的最大卡片数
const duration = Math.random() * 5 + 9;   // 飘动时长 9-14 秒
setInterval(pollNew, 3000);               // 每 3 秒检查新祝福
setInterval(floatNext, 6000);             // 每 6 秒飘一条旧祝福
```

### 修改限流参数

编辑 `server.js` 中的限流配置：

```javascript
const RATE_LIMIT_MS = 60000;  // 限流时间窗口（毫秒），默认 1 分钟
```

### 添加敏感词

编辑 `server.js` 中的敏感词列表：

```javascript
const sensitiveWords = [
  '政治', '暴力', '色情', '赌博', '毒品',
  // ... 自定义添加更多敏感词
];
```

## 数据结构

**blessings 表**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER | 自增主键 |
| `name` | TEXT | 祝福者姓名 |
| `message` | TEXT | 祝福内容 |
| `time` | TEXT | 提交时间 |
| `likes` | INTEGER | 赞数（默认 0） |

数据库文件：`blessings.db`（项目根目录）

## 性能优化

- ✅ 字体预连接，减少加载延迟
- ✅ 使用 CSS `clamp()` 实现流畅响应式，无需媒体查询
- ✅ 智能去重，避免单次循环内重复显示
- ✅ 增量拉取新祝福，降低服务器负载
- ✅ 流畅 CSS 动画，无需 JS 计时器

## 浏览器兼容性

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

需要支持 CSS Grid、`backdrop-filter`、`clamp()` 和 ES6 JavaScript。

## 项目结构

```
wedding-blessing/
├── server.js                 # 后端主文件（Express 服务器）
├── package.json             # 依赖配置
├── blessings.db             # SQLite 数据库（自动生成）
├── 1.txt                    # 辅助文档
├── README.md                # 本文件
└── public/
    ├── index.html           # 大屏展示页面
    ├── write.html           # 宾客写祝福页面
    ├── welcome.html         # 欢迎页面
    ├── all-blessings.html   # 祝福列表汇总页
    └── assets/              # 静态资源（图片等）
```

## API 接口文档

### 获取祝福列表

**GET `/api/blessings`**

查询参数：
- `since` (可选) — 增量查询，仅返回 ID > 此值的祝福
- `limit` (可选) — 返回数量限制
- `offset` (可选) — 分页偏移量

示例：
```bash
# 获取所有祝福
curl http://localhost:8888/api/blessings

# 分页获取（每页 10 条）
curl "http://localhost:8888/api/blessings?limit=10&offset=0"

# 增量查询（获取 ID > 100 的新祝福）
curl "http://localhost:8888/api/blessings?since=100"
```

响应：
```json
{
  "total": 42,
  "offset": 0,
  "blessings": [
    {
      "id": 42,
      "name": "张三",
      "message": "祝两位新婚快乐！",
      "time": "2026/5/7 18:30:45",
      "likes": 3
    }
  ]
}
```

---

### 提交祝福

**POST `/api/blessings`**

请求体：
```json
{
  "name": "祝福者名字",
  "message": "祝福内容"
}
```

验证规则：
| 字段 | 限制 | 错误提示 |
|------|------|--------|
| `name` | 必填，≤ 20 字 | 名字和祝福语不能为空 / 名字太长啦，20字以内 |
| `message` | 必填，≤ 200 字 | 名字和祝福语不能为空 / 祝福语太长啦，200字以内 |
| 敏感词 | 禁止提交 | 内容包含不当词汇，请修改后重试 |
| 限流 | 同 IP 1 分钟仅 1 条 | 提交太频繁啦，请等待 X 秒后再试 |

示例：
```bash
curl -X POST http://localhost:8888/api/blessings \
  -H "Content-Type: application/json" \
  -d '{"name":"李四","message":"永结同心，百年好合！"}'
```

成功响应（201）：
```json
{
  "success": true,
  "blessing": {
    "id": 43,
    "name": "李四",
    "message": "永结同心，百年好合！",
    "time": "2026/5/7 18:35:12",
    "likes": 0
  }
}
```

错误响应（400/429）：
```json
{
  "error": "名字太长啦，20字以内~"
}
```

---

### 点赞祝福

**POST `/api/blessings/:id/like`**

路径参数：
- `id` — 祝福的 ID

示例：
```bash
curl -X POST http://localhost:8888/api/blessings/42/like
```

响应：
```json
{
  "success": true,
  "likes": 4
}
```

---

### 删除祝福（管理员）

**DELETE `/api/blessings/:id`**

删除单条祝福：
```bash
curl -X DELETE http://localhost:8888/api/blessings/42
```

**DELETE `/api/blessings`**

清空所有祝福：
```bash
curl -X DELETE http://localhost:8888/api/blessings
```

---

## 表单验证详解

### 姓名验证
- **长度** — 1~20 字符
- **空格处理** — 自动 trim（前后去空格）
- **敏感词** — 检测完整敏感词列表

### 祝福内容验证
- **长度** — 1~200 字符
- **空格处理** — 自动 trim
- **敏感词** — 检测完整敏感词列表（包括粗言秽语）
- **换行符** — 支持 `\n` 保存

### 限流验证
- **计数方式** — 基于客户端 IP 地址
- **识别顺序** — `X-Forwarded-For` > `X-Real-IP` > `remoteAddress`
- **窗口** — 滑动时间窗口（1 分钟）
- **清理** — 每 10 分钟自动清理过期记录

---

## 开发指南

### 本地调试

```bash
# 1. 安装依赖
npm install

# 2. 启动服务（开发模式）
node server.js

# 3. 打开浏览器
# 大屏展示: http://localhost:8888
# 写祝福: http://localhost:8888/write
# 列表页: http://localhost:8888/all-blessings
```

### 修改页面内容

编辑 `public/` 下的 HTML 文件：
- `index.html` — 大屏展示页，包含动画和轮播逻辑
- `write.html` — 写祝福表单页
- `welcome.html` — 欢迎页（可选）
- `all-blessings.html` — 祝福列表详情页

### 修改样式和动画

编辑 HTML 文件的 `<style>` 标签：
- 颜色方案 — 修改 CSS 变量或 color 值
- 动画时长 — 在 `@keyframes` 中修改 duration
- 响应式断点 — 修改 `clamp()` 参数或媒体查询

### 调试 API

使用 cURL、Postman 或 fetch 测试：

```javascript
// 获取祝福列表
fetch('http://localhost:8888/api/blessings')
  .then(r => r.json())
  .then(data => console.log(data));

// 提交祝福
fetch('http://localhost:8888/api/blessings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '测试', message: '测试祝福' })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## 常见问题 (FAQ)

### Q: 如何修改限流时间？
**A:** 编辑 `server.js`，找到 `const RATE_LIMIT_MS = 60000;`，改为需要的毫秒数（如 30000 = 30 秒）。

### Q: 为什么提交被拒绝了？
**A:** 可能原因：
- 包含敏感词 → 检查 `sensitiveWords` 列表
- 1 分钟内重复提交 → 等待时间后重试
- 字段过长 → 名字 ≤ 20 字，祝福 ≤ 200 字
- 字段为空 → 两个字段都不能为空

### Q: 如何在生产环境中运行？
**A:** 使用进程管理工具（PM2）：
```bash
npm install -g pm2
pm2 start server.js --name "wedding-blessing"
pm2 startup
pm2 save
```

### Q: 数据库崩溃了怎么办？
**A:** 删除 `blessings.db` 文件，重启服务会自动重建空数据库。已有数据会丢失，建议定期备份。

### Q: 如何在局域网内访问？
**A:** 
1. 启动服务后查看控制台输出的 IP
2. 其他设备访问 `http://你的IP:8888`
3. 注意防火墙不要阻止 8888 端口

### Q: 支持 HTTPS 吗？
**A:** 本项目不直接支持 HTTPS，建议使用反向代理（Nginx）处理。

### Q: 如何导出数据？
**A:** `blessings.db` 是标准 SQLite 数据库，可用任何 SQLite 工具打开：
```bash
sqlite3 blessings.db "SELECT * FROM blessings;"
```

---

## 故障排查

### 服务启动失败

**错误：`Error: Cannot find module 'express'`**
```bash
# 解决：安装依赖
npm install
```

**错误：`EADDRINUSE: address already in use :::8888`**
```bash
# 解决：更改端口号，编辑 server.js 第 7 行
const PORT = 8889;  // 改为其他端口
```

### 数据库错误

**错误：`Error: SQLITE_CANTOPEN`**
```bash
# 解决：确保有写入权限，或删除损坏的数据库文件
rm blessings.db
node server.js
```

### 页面显示错误

**表单提交后无反应**
- 打开浏览器开发者工具（F12）查看 Console
- 检查网络请求（Network 标签）
- 确认 API 返回的错误信息

**大屏祝福不更新**
- 检查轮询间隔设置（`setInterval(pollNew, 3000)` 默认 3 秒）
- 确认网络连接正常
- 清空浏览器缓存（Ctrl+Shift+Del）

### 限流问题

**频繁出现"提交太频繁"**
- 确认不是真的 1 分钟内多次提交
- 若是不同设备，检查它们的 IP 是否相同（NAT/代理环境）

---

## 部署建议

### 生产环境最佳实践

**使用进程管理器**
```bash
npm install -g pm2
pm2 start server.js --name "wedding" --max-memory-restart 500M
pm2 logs wedding
```

**配置反向代理（Nginx）**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8888;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**定期备份数据**
```bash
cp blessings.db blessings.db.backup
# 或设置定时任务
# 0 2 * * * cp /path/to/blessings.db /path/to/backups/blessings.db.$(date +%Y%m%d)
```

**监控和日志**
- 使用 PM2 自带的监控：`pm2 monit`
- 定期检查大屏页面是否正常轮播
- 记录异常提交的 IP 以防止滥用

---

## 许可证

MIT License
