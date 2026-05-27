@echo off
chcp 65001 >nul
title Stock AI Analysis - 启动

echo ========================================
echo    Stock AI Analysis APP - 启动脚本
echo ========================================
echo.

REM 检查 Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python，请先安装 Python 3.9+
    pause
    exit /b 1
)

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

echo [1/4] 安装后端依赖...
cd /d "%~dp0backend"
pip install -r requirements.txt -q
if %errorlevel% neq 0 (
    echo [错误] 后端依赖安装失败
    pause
    exit /b 1
)

echo [2/4] 启动后端服务...
start "Stock-AI-Backend" cmd /c "cd /d %~dp0backend && python app.py"

echo [3/4] 安装前端依赖...
cd /d "%~dp0mobile"
call npm install
if %errorlevel% neq 0 (
    echo [错误] 前端依赖安装失败
    pause
    exit /b 1
)

echo [4/4] 启动 Expo 开发服务器...
echo.
echo ========================================
echo   后端: http://localhost:5000
echo   前端: Expo Dev Server (扫描二维码)
echo ========================================
echo.
npx expo start

pause
