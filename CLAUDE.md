# Stock AI Analysis APP

React Native Expo 智能股票分析应用，前端 TypeScript + NativeWind，后端 Python Flask + DeepSeek AI。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React Native Expo SDK 52 (TypeScript 5.3) |
| UI 样式 | NativeWind 4 (Tailwind CSS 3) |
| 导航 | React Navigation 7 (native-stack) |
| 状态管理 | Zustand 5 |
| HTTP | Axios |
| 持久化 | AsyncStorage |
| 图表 | react-native-svg (自定义 SVG K线图) |
| 动画 | React Native Reanimated 3.16 |
| 后端 | Python Flask + waitress (生产模式) |
| 数据源 | akshare (沪深A股) |
| 技术指标 | ta (Technical Analysis Library) |
| AI | DeepSeek API |
| 部署目标 | Railway (后端) + Expo EAS Build (APK) |

## 项目结构

当前实际结构（骨架阶段，src/ 和 backend/ 尚未创建）：

```
d:\zhoutao\
├── App.tsx                 # 应用入口，GestureHandler + Navigator
├── app.json                # Expo 配置（dark theme, #0D0D0D 背景）
├── package.json            # 依赖声明
├── tailwind.config.js      # NativeWind + 自定义金融配色
├── tsconfig.json           # TypeScript 配置，@/ → src/
├── metro.config.js         # Metro bundler 配置
├── babel.config.js         # Babel 配置
├── eas.json                # EAS Build 配置
├── global.css              # 全局样式入口
├── nativewind-env.d.ts     # NativeWind 类型声明
├── start.bat / start.sh    # 一键启动脚本
├── deploy.bat              # 部署脚本
└── README.md               # 完整项目文档和 API 说明
```

计划结构（README 描述）：

```
stock-ai-app/
├── backend/
│   ├── app.py              # Flask API 主文件
│   ├── requirements.txt    # Python 依赖
│   └── .env                # DeepSeek API Key 配置
└── src/
    ├── components/         # 可复用 UI 组件
    ├── screens/            # 页面
    ├── navigation/         # React Navigation 配置
    ├── services/           # API 调用层（api-config.ts 管理后端地址）
    ├── store/              # Zustand store
    ├── types/              # TypeScript 类型定义
    └── constants/          # 颜色常量、配置
```

## 路径别名

`@/*` → `src/*`（tsconfig.json 中配置）

## 配色方案（Tailwind 自定义颜色）

- 背景：bg `#0D0D0D`，卡片 `#1A1A2E`/`#16213E`，输入框 `#1E1E3A`
- 主色：primary `#2962FF`，primary-light `#448AFF`
- 强调：accent `#00E5FF`，accent-green `#00E676`
- 涨跌：rise `#FF4444` (红涨)，fall `#00C853` (绿跌)
- 边框：border `#2A2A4A`/`#3A3A5A`
- 文字：text-secondary `#9E9E9E`，text-muted `#616161`
- 功能色：danger `#FF1744`，warning `#FFD740`
- UI 风格：TradingView/Bloomberg 深色金融风，userInterfaceStyle: dark

## 常用命令

```bash
# 前端
npm install                  # 安装依赖
npx expo start               # 启动 Expo 开发服务器
npx expo start --clear       # 清除缓存启动
npx expo start --android     # 直接启动 Android
npx eas build --platform android --profile preview   # 构建 APK

# 后端（待创建）
cd backend
pip install -r requirements.txt
python app.py                # 开发模式
```

## API 设计

- `GET /analyze?code=STOCK_CODE` — 完整技术分析（K线、MA/MACD/RSI、AI 分析报告）
- `GET /search?keyword=KEYWORD` — 搜索股票
- `GET /health` — 健康检查

## 当前状态

**骨架阶段**：配置文件齐全，但 src/ 和 backend/ 目录尚未创建。App.tsx import 了 `./src/navigation/AppNavigator` 和 `./src/store/useStore`，这些模块待编写。

目标：补全所有业务代码 → 后端部署 Railway → 前端构建独立 APK。

## 环境

- Windows 11 Pro
- Node.js v24.16.0, npm 11.13.0
- Git 2.54.0
- Python 待安装
