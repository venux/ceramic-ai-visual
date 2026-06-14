# 陶瓷AI视觉工厂

景德镇陶瓷电商一站式AI视觉内容平台，整合产品图生成、详情页自动化、素材库三大能力。

## 技术栈

| 层 | 选型 |
|----|------|
| 前端 | Vue3 + TypeScript + Element Plus |
| 后端 | NestJS + TypeScript |
| 数据库 | MongoDB |
| AI推理 | ComfyUI + SDXL + ControlNet |
| 部署 | Nginx + Systemd |

## 快速开始

```bash
# 克隆项目
git clone <repo-url> ceramic-ai-visual
cd ceramic-ai-visual

# 后端
cd server
cp .env.example .env
npm install
npm run start:dev

# 前端
cd ../web
npm install
npx vite dev
```

访问 http://localhost:5173/ceramic/

## 开发指南

### 目录结构

```
ceramic-ai-visual/
├── server/          # NestJS后端
│   └── src/
│       ├── auth/    # JWT认证
│       ├── users/   # 用户+额度管理
│       ├── scenes/  # 场景管理
│       ├── tasks/   # 任务管理
│       └── storage/ # 图片存储
├── web/             # Vue3前端
│   └── src/
│       ├── views/       # 页面
│       ├── components/  # 组件
│       ├── api/         # 接口封装
│       └── stores/      # Pinia状态
└── uploads/         # 图片存储
```

### 开发规范

- 后端严格五层架构：Model → Repository → Service → Controller → DTO
- 前端 Element Plus 手动 import，不用 auto-import
- API 统一响应格式：`{ code, message, data }`
- Vite base = `/ceramic/`

## 部署说明

```bash
# 一键部署
chmod +x deploy.sh
./deploy.sh
```

### systemd 服务配置

创建 `/etc/systemd/system/ceramic-ai-visual.service`：

```ini
[Unit]
Description=Ceramic AI Visual Server
After=network.target mongod.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/ceramic-ai-visual/server
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable ceramic-ai-visual
sudo systemctl start ceramic-ai-visual
```

### Nginx 配置

```nginx
location /ceramic/ {
    proxy_pass http://127.0.0.1:3400;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## API 文档

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/users/me | 当前用户信息 |
| GET | /api/users/credits | 剩余额度 |
| GET | /api/scenes | 场景列表 |
| POST | /api/tasks | 创建生成任务 |
| GET | /api/tasks | 历史任务 |
| POST | /api/storage/upload | 上传图片 |
