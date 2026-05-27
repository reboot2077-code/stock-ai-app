@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ============================================
echo   Stock AI App - 一键部署 & 打包
echo ============================================
echo.
echo 注意：请确保当前网络可以访问外网！
echo （公司网络不行，请连手机热点或回家再做）
echo.
set /p CONFIRM="准备好了？按回车继续..."

echo.
echo ==========================================
echo  Step 1/3: 部署后端到 Railway
echo ==========================================
echo.
echo 浏览器会打开 railway.app，用 GitHub 登录即可。
echo （如果打不开 GitHub，Railway 也支持邮箱注册）
echo.
cd backend

echo 正在登录 Railway...
call npx railway login
if errorlevel 1 (
    echo 登录失败！请检查网络后重试。
    pause
    exit /b 1
)

echo.
echo 正在初始化项目...
call npx railway init --name stock-ai-backend
if errorlevel 1 (
    echo 初始化失败，可能项目名已存在，尝试直接部署...
)

echo.
echo 正在部署后端（需要 2-5 分钟）...
call npx railway up --detach
if errorlevel 1 (
    echo 部署失败！
    pause
    exit /b 1
)

echo.
echo 正在获取后端 URL...
call npx railway domain > nul 2>&1
for /f "tokens=*" %%i in ('npx railway domain 2^>nul ^| findstr "up.railway.app"') do set BACKEND_URL=%%i

if "%BACKEND_URL%"=="" (
    echo.
    echo ========================================
    echo 请手动获取后端 URL:
    echo 1. 打开 https://railway.app 并登录
    echo 2. 点击你的 stock-ai-backend 项目
    echo 3. 在 Settings - Domains 中找到 URL
    echo ========================================
    echo.
    set /p BACKEND_URL="请粘贴后端 URL (例如 https://xxx.up.railway.app): "
)

echo.
echo 后端地址: %BACKEND_URL%
echo.

echo ==========================================
echo  Step 2/3: 更新 APP 配置
echo ==========================================
cd ..\mobile
echo const API_BASE_URL = '%BACKEND_URL%'; > src\services\api-config.ts
echo 已更新 API 地址为: %BACKEND_URL%

echo.
echo ==========================================
echo  Step 3/3: 构建 APK
echo ==========================================
echo.
echo 需要 Expo 账号。如果还没有，请先去 https://expo.dev 注册（免费）
echo 浏览器会打开登录页面...
echo.

echo 正在登录 Expo...
call npx eas-cli login
if errorlevel 1 (
    echo 登录失败！
    pause
    exit /b 1
)

echo.
echo 正在构建 APK（云构建，需要 10-30 分钟）...
echo 构建完成后会显示下载链接...
echo.
call npx eas-cli build --platform android --profile preview --non-interactive

echo.
echo ============================================
echo   完成！
echo   复制上面的 APK 下载链接到浏览器即可下载
echo   安装到手机后即可随时随地使用
echo ============================================
pause
