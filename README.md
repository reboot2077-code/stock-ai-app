# Stock AI Analysis APP - 安卓 AI 股票分析

基于 React Native Expo + Python Flask + DeepSeek AI 的智能股票分析应用。

## 功能特性

- **实时股票数据**：通过 akshare 获取沪深A股实时行情
- **K线图表**：自定义 SVG 渲染的专业K线图，支持 MA/MACD/成交量
- **AI 智能分析**：接入 DeepSeek API，综合技术指标给出操作建议
- **自选股管理**：本地持久化存储，支持添加/删除自选股
- **股票搜索**：支持按代码或名称搜索沪深A股
- **技术指标**：MA5/10/20/60、MACD、RSI、布林带、ATR
- **深色金融UI**：TradingView/Bloomberg 风格的专业界面

## 项目结构

```
stock-ai-app/
├── README.md
├── start.bat              # Windows 一键启动
├── start.sh               # Linux/Mac 一键启动
├── backend/               # Flask 后端
│   ├── app.py             # 主 API 服务
│   ├── requirements.txt   # Python 依赖
│   └── .env               # 环境变量（需手动创建）
└── mobile/                # React Native Expo 前端
    ├── App.tsx            # 应用入口
    ├── package.json       # Node 依赖
    ├── app.json           # Expo 配置
    ├── tailwind.config.js # Tailwind CSS 配置
    └── src/
        ├── components/    # 可复用组件
        ├── screens/       # 页面
        ├── navigation/    # 导航配置
        ├── services/      # API 服务
        ├── store/         # Zustand 状态管理
        ├── types/         # TypeScript 类型
        └── constants/     # 颜色/常量
```

## 环境要求

### 后端
- Python 3.9+
- pip

### 移动端
- Node.js 18+
- npm
- Expo Go App（手机端，用于开发调试）

## 安装教程

### 1. 克隆项目

```bash
cd stock-ai-app
```

### 2. 配置 DeepSeek API

在 `backend/` 目录下创建 `.env` 文件：

```env
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com/chat/completions
```

> 获取 API Key: https://platform.deepseek.com/

注意：不配置 API Key 也可运行，系统将使用基础技术分析替代 AI 分析。

### 3. 启动后端

```bash
cd backend
pip install -r requirements.txt
python app.py
```

后端将在 http://localhost:5000 启动。

### 4. 启动移动端

```bash
cd mobile
npm install
npx expo start
```

扫描终端中的二维码，使用 Expo Go App 打开。

## 安卓运行教程

### 方式一：Expo Go（推荐，无需 Android Studio）

1. 手机上安装 **Expo Go** App（Google Play 或官网下载 APK）
2. 确保手机和电脑在同一 WiFi 网络
3. 运行 `npx expo start`
4. 用 Expo Go 扫描终端中的二维码
5. 打开后即可使用

### 方式二：构建独立 APK

使用 Expo EAS Build 云构建：

```bash
cd mobile
npx eas login
npx eas build --platform android --profile preview
```

构建完成后会收到 APK 下载链接。

## API 说明

### GET /analyze?code=STOCK_CODE

返回股票的完整技术分析数据。

**示例请求**：
```
GET http://localhost:5000/analyze?code=000001
```

**返回字段**：
| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 股票代码 |
| stock_name | string | 股票名称 |
| price | number | 最新价格 |
| change_percent | number | 涨跌幅(%) |
| volume | number | 成交量 |
| rsi | number | RSI(14)指标值 |
| ma | object | MA5/MA10/MA20/MA60 |
| macd | object | DIF/DEA/Histogram |
| support | number | 支撑位 |
| pressure | number | 压力位 |
| risk_level | string | 风险等级(low/medium/high) |
| trend | string | 当前趋势 |
| ai_analysis | string | AI分析报告(Markdown) |
| kline | array | K线数据(OHLCV) |
| news | array | 相关新闻 |

### GET /search?keyword=KEYWORD

搜索股票。

**返回**：
```json
{
  "stocks": [
    { "code": "000001", "name": "平安银行", "exchange": "SZ" }
  ]
}
```

### GET /health

健康检查。返回 `{"status": "ok"}`。

## 常见问题解决

### 后端问题

**Q: `akshare` 安装失败？**
```bash
pip install --upgrade pip
pip install akshare --no-cache-dir
```

**Q: 获取不到股票数据？**
- 检查股票代码是否正确（6位数字）
- akshare 依赖网络请求，确保网络畅通
- 部分时段（非交易时间）数据可能延迟

**Q: DeepSeek API 调用失败？**
- 检查 `.env` 中的 API Key 是否正确
- 检查网络是否能访问 api.deepseek.com
- 不配置 API Key 也能使用基础分析功能

### 移动端问题

**Q: `npm install` 失败？**
```bash
npm cache clean --force
npm install
```

**Q: Expo Go 连不上后端？**
- Android 模拟器：API 地址使用 `http://10.0.2.2:5000`
- 真机：将 `mobile/src/services/api.ts` 中的 `BASE_URL` 改为电脑 IP
- 防火墙：确保 5000 端口已开放

**Q: 启动报 "Unable to resolve module"？**
```bash
npx expo start --clear
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React Native Expo (TypeScript) |
| UI样式 | NativeWind (Tailwind CSS) |
| 导航 | React Navigation 7 |
| 动画 | React Native Reanimated |
| 状态管理 | Zustand |
| 图表 | react-native-svg (自定义K线) |
| 后端 | Python Flask |
| 数据源 | akshare |
| 技术指标 | ta (Technical Analysis Library) |
| AI | DeepSeek API |
| 数据科学 | pandas, numpy |

## 免责声明

本应用仅供学习和技术研究使用，所有分析结果仅供参考，**不构成任何投资建议**。股市有风险，投资需谨慎。
