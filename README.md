# 婚礼祝福墙 💕

一个浪漫的婚礼祝福展示系统，支持实时祝福飘动效果和移动端扫码写祝福。

## 功能特性

- **实时祝福飘动** — 祝福卡片以多种方向和样式在屏幕上飘动，营造浪漫氛围
- **多样式卡片** — 4 种粉色系渐变卡片样式，随机展示增加视觉层次
- **防重复显示** — 智能去重机制，确保每条祝福在一个循环内只显示一次
- **完整响应式** — 适配手机、平板、4K 大屏等各种设备
- **移动端写祝福** — 扫码即可在手机上写下祝福
- **实时更新** — 新祝福自动推送到大屏，3 秒内显示

## 技术栈

- **前端** — 原生 HTML/CSS/JavaScript，无框架依赖
- **后端** — Node.js + Express
- **数据库** — SQLite (better-sqlite3)
- **字体** — Google Fonts (Ma Shan Zheng, Noto Serif SC)

## 使用方法

### 启动服务

```bash
node server.js
```

服务默认运行在 `http://localhost:3000`

### 访问页面

- **大屏展示页** — `http://localhost:3000` 
  - 用于婚礼现场投影或大屏展示
  - 自动轮播所有祝福，实时显示新祝福

- **写祝福页** — `http://localhost:3000/write.html`
  - 用于宾客扫码写祝福
  - 移动端优化，简洁易用

## 性能优化

- ✅ 使用 `<link>` 标签加载字体，避免 `@import` 阻塞渲染
- ✅ 添加 `preconnect` 优化字体加载速度
- ✅ 使用 `clamp()` 实现流畅响应式，无需媒体查询
- ✅ 智能去重机制，避免祝福重复显示
- ✅ 增量拉取新祝福，减少服务器负载

## 自定义配置

### 修改新人名字和日期

编辑 `public/index.html`：

```html
<div class="names">王涛 & 恬恬</div>
<div class="subtitle">永结同心 · 百年好合</div>
<div class="date">2026年5月12日</div>
```

### 调整飘动参数

在 `public/index.html` 的 JavaScript 部分：

```javascript
let maxOnScreen = 8;  // 同时显示的最大卡片数
```

动画时长在 `createFloatCard` 函数中：

```javascript
const duration = Math.random() * 5 + 9;  // 9-14秒随机
```

### 修改轮询间隔

```javascript
setInterval(pollNew, 3000);    // 每3秒检查新祝福
setInterval(floatNext, 6000);  // 每6秒飘一条旧祝福
```

## 数据存储

祝福数据存储在 `blessings.db` SQLite 数据库中，包含以下字段：

- `id` — 自增主键
- `name` — 祝福者姓名
- `message` — 祝福内容
- `created_at` — 创建时间

## 浏览器兼容性

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

需要支持 CSS `clamp()`、`backdrop-filter` 和现代 JavaScript 特性。

## 许可证

MIT License
