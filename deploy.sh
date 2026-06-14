#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=============================="
echo "  陶瓷AI视觉工厂 - 一键部署"
echo "=============================="

# 1. 构建后端
echo ""
echo "[1/4] 构建后端..."
cd server
npm run build
cd ..
echo "✅ 后端构建完成"

# 2. 构建前端
echo ""
echo "[2/4] 构建前端..."
cd web
npx vite build
cd ..
echo "✅ 前端构建完成"

# 3. 创建上传目录
echo ""
echo "[3/4] 创建上传目录..."
mkdir -p uploads/original uploads/result uploads/scene
echo "✅ 上传目录已就绪"

# 4. 重启服务
echo ""
echo "[4/4] 重启服务..."
sudo systemctl restart ceramic-ai-visual
sudo systemctl is-active --quiet ceramic-ai-visual && echo "✅ 服务已启动" || echo "❌ 服务启动失败"

echo ""
echo "=============================="
echo "  部署完成！"
echo "  访问地址: http://localhost:3400/ceramic/"
echo "=============================="
