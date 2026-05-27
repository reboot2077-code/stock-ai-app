#!/bin/bash

echo "========================================"
echo "   Stock AI Analysis APP - 启动脚本"
echo "========================================"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[错误] 未找到 Python，请先安装 Python 3.9+"
    exit 1
fi

PYTHON=$(command -v python3 || command -v python)

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未找到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[1/4] 安装后端依赖..."
cd "$SCRIPT_DIR/backend"
$PYTHON -m pip install -r requirements.txt -q
if [ $? -ne 0 ]; then
    echo "[错误] 后端依赖安装失败"
    exit 1
fi

echo "[2/4] 启动后端服务..."
$PYTHON app.py &
BACKEND_PID=$!

echo "[3/4] 安装前端依赖..."
cd "$SCRIPT_DIR/mobile"
npm install
if [ $? -ne 0 ]; then
    echo "[错误] 前端依赖安装失败"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "[4/4] 启动 Expo 开发服务器..."
echo ""
echo "========================================"
echo "  后端: http://localhost:5000"
echo "  前端: Expo Dev Server (扫描二维码)"
echo "========================================"
echo ""
npx expo start

# 清理
kill $BACKEND_PID 2>/dev/null
