# AGENTS.md — 陶瓷AI视觉工厂

## 项目概述
陶瓷电商一站式AI视觉内容平台，整合产品图生成、详情页自动化、素材库三大能力。
目标用户：景德镇陶瓷电商中小卖家。

## 技术栈
| 层 | 选型 | 说明 |
|----|------|------|
| 前端 | Vue3 + TypeScript + Element Plus | 亮色主题，Vite构建 |
| 后端 | NestJS + TypeScript | 五层架构：Model→Repository→Service→Controller→DTO |
| 数据库 | MongoDB | Mongoose ODM |
| AI推理 | ComfyUI + SDXL + ControlNet | 产品图生成、抠图、风格转换 |
| 存储 | 本地文件系统 | uploads/ 目录 |
| 部署 | Nginx + Systemd | 端口3400，路径/ceramic/ |

## 目录结构
```
ceramic-ai-visual/
├── server/                 # NestJS后端 (port 3400)
│   └── src/
│       ├── main.ts         # 入口
│       ├── app.module.ts   # 根模块
│       ├── config/         # 环境配置
│       ├── common/         # 守卫/过滤器/装饰器/基类
│       ├── auth/           # JWT认证（复用Venux Core）
│       ├── users/          # 用户+额度管理
│       ├── scenes/         # 场景管理（6个默认场景）
│       ├── tasks/          # 任务管理（上传→生成→结果）
│       └── storage/        # 图片存储服务
├── web/                    # Vue3前端
│   └── src/
│       ├── views/Home.vue  # 核心：上传+场景+生成+结果
│       ├── views/History   # 历史记录
│       ├── views/User.vue  # 用户中心
│       ├── components/     # ImageUploader/SceneCard/ResultGallery
│       ├── api/            # axios封装+接口模块
│       └── stores/         # Pinia状态管理
├── uploads/                # 图片存储 (original/result/scene)
├── AGENTS.md               # 本文件
└── product-plan.md         # 完整产品规划文档
```

## 开发规范
- 后端严格五层架构，禁止跨层调用
- 前端Element Plus手动import，不用auto-import
- API统一响应格式：`{ code, message, data }`
- Token从`localStorage('token')`读取，复用Venux Core认证
- Vite base = `/ceramic/`，axios baseURL = `import.meta.env.BASE_URL + 'api'`

## 构建与部署
```bash
# 后端
cd server && npm run build
sudo systemctl restart ceramic-ai-visual

# 前端
cd web && npx vite build

# 部署
./deploy.sh
```

## API端点
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/users/me | 当前用户信息 |
| GET | /api/users/credits | 剩余额度 |
| GET | /api/scenes | 所有场景列表 |
| GET | /api/scenes/:category | 按分类筛选场景 |
| POST | /api/tasks | 创建生成任务 |
| GET | /api/tasks | 用户历史任务 |
| GET | /api/tasks/:id | 任务详情 |
| POST | /api/storage/upload | 上传图片 |

## 待完成（需GPU验证）
- [ ] ComfyUI workflow集成（产品图生成/抠图/风格转换）
- [ ] 陶瓷材质LoRA训练
- [ ] SAM2抠图集成
- [ ] 详情页生成模块（P1）
- [ ] 素材库浏览+AI定制（P2）
- [ ] 微信/支付宝支付集成
- [ ] 批量处理功能
