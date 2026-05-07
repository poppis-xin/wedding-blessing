# 💒 婚礼祝福网站

一个优雅的在线婚礼祝福收集平台，让亲朋好友可以线上留下温暖的祝福与美好祝愿。

## ✨ 功能特性

- 📝 **在线留言**: 来宾可以便捷地填写、提交祝福内容
- 👀 **查看祝福**: 实时展示所有已提交的祝福内容
- 🎵 **背景音乐**: 营造温馨的网站氛围
- 🛡️ **内容审核**: 
  - IP 限流防刷（1分钟限制1次提交）
  - 敏感词自动过滤
- 💾 **数据持久化**: 使用 SQLite 数据库存储所有祝福

## 🚀 快速开始

### 环境要求

- Node.js (v14+)
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆/下载项目
cd wedding-blessing

# 2. 安装依赖
npm install

# 3. 启动服务器
node server.js
```

服务器将在 `http://localhost:8888` 启动。在浏览器中打开此地址即可使用。

## 📁 项目结构

```
wedding-blessing/
├── server.js              # Express 后端服务器
├── package.json           # 项目配置和依赖
├── blessings.db          # SQLite 数据库（自动生成）
└── public/               # 前端静态文件
    ├── index.html        # 主页面
    ├── welcome.html      # 欢迎页
    ├── write.html        # 写祝福页面
    ├── all-blessings.html # 查看所有祝福
    ├── music.js          # 背景音乐控制
    └── assets/           # 图片、样式等资源
```

## 🔧 API 端点

### 提交祝福
```http
POST /api/blessing
Content-Type: application/json

{
  "name": "来宾名字",
  "message": "祝福内容"
}
```

### 获取所有祝福
```http
GET /api/blessings
```

## ⚙️ 配置选项

编辑 `server.js` 修改以下配置：

- **PORT**: 服务器端口（默认 8888）
- **RATE_LIMIT_MS**: IP 防刷时间间隔（默认 60000ms = 1分钟）
- **sensitiveWords**: 敏感词列表（可按需添加）

## 📝 敏感词过滤

系统内置了敏感词过滤机制，涵盖政治、暴力、不文明等内容。如需修改敏感词列表，请编辑 `server.js` 中的 `sensitiveWords` 数组。

## 🛡️ 安全特性

- ✅ IP 限流：防止恶意刷屏
- ✅ 内容过滤：自动过滤不适当内容
- ✅ 数据验证：确保输入数据有效性

## 📦 依赖包

- **express**: 5.2.1 - Web 框架
- **better-sqlite3**: 12.9.0 - SQLite 数据库驱动
- **sql.js**: 1.14.1 - SQL 处理工具

## 📄 许可证

ISC License

## 👨‍💻 开发者

如有问题或建议，欢迎反馈！

---

💝 祝大家在这个特殊的日子里收获满满的祝福和回忆！
