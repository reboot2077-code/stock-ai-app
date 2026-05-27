import os
import json
import traceback
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import requests
import yfinance as yf
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv(
    "DEEPSEEK_BASE_URL", "https://api.deepseek.com/chat/completions"
)

# Stock name cache
_stock_names: dict[str, str] = {}


def _load_stock_names():
    global _stock_names
    if _stock_names:
        return
    try:
        df = pd.read_csv(
            "https://raw.githubusercontent.com/reboot2077-code/stock-ai-app/master/backend/stock_list.csv"
        )
        _stock_names = dict(zip(df["code"].astype(str), df["name"].astype(str)))
    except Exception:
        _stock_names = {}


def _get_stock_name(code: str) -> str:
    _load_stock_names()
    return _stock_names.get(code, code)


def _to_yf_code(code: str) -> str:
    if code.startswith("6") or code.startswith("5"):
        return f"{code}.SS"
    elif code.startswith("0") or code.startswith("3") or code.startswith("1"):
        return f"{code}.SZ"
    return f"{code}.SS"


def calc_ma(close: pd.Series, period: int):
    if len(close) < period:
        return [None] * len(close)
    return close.rolling(window=period).mean().round(4).tolist()


def calc_macd(close: pd.Series, fast=12, slow=26, signal=9):
    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()
    dif = (ema_fast - ema_slow).round(4)
    dea = dif.ewm(span=signal, adjust=False).mean().round(4)
    hist = ((dif - dea) * 2).round(4)
    return dif.tolist(), dea.tolist(), hist.tolist()


def calc_rsi(close: pd.Series, period=14):
    delta = close.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = (-delta).where(delta < 0, 0.0)
    avg_gain = gain.ewm(alpha=1 / period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = (100 - (100 / (1 + rs))).round(2)
    return rsi.tolist()


def calc_bollinger(close: pd.Series, period=20, std=2):
    ma = close.rolling(period).mean()
    sd = close.rolling(period).std()
    upper = (ma + std * sd).round(4)
    lower = (ma - std * sd).round(4)
    return upper.tolist(), ma.round(4).tolist(), lower.tolist()


def find_support_resistance(df: pd.DataFrame):
    close = df["close"].values
    high = df["high"].values
    low = df["low"].values
    recent_high = float(np.max(high[-20:]))
    recent_low = float(np.min(low[-20:]))
    ma20 = float(close[-20:].mean()) if len(close) >= 20 else float(close[-1])
    return round(recent_low, 2), round(max(recent_high, ma20), 2)


def assess_trend(df: pd.DataFrame) -> str:
    close = df["close"]
    if len(close) < 60:
        return "数据不足"
    ma5 = close[-5:].mean()
    ma10 = close[-10:].mean()
    ma20 = close[-20:].mean()
    ma60 = close[-60:].mean()
    current = close.iloc[-1]
    if ma5 > ma10 > ma20 > ma60 and current > ma5:
        return "强势上涨"
    elif ma5 > ma10 > ma20:
        return "短期上涨"
    elif ma5 < ma10 < ma20 < ma60 and current < ma5:
        return "强势下跌"
    elif ma5 < ma10 < ma20:
        return "短期下跌"
    else:
        return "震荡整理"


def assess_risk(rsi_val: float, trend: str, change_pct: float) -> str:
    score = 0
    if rsi_val is not None:
        if rsi_val > 80:
            score += 3
        elif rsi_val > 70:
            score += 2
        elif rsi_val < 20:
            score += 2
        elif rsi_val < 30:
            score += 1
    if "下跌" in trend:
        score += 2
    elif "震荡" in trend:
        score += 1
    if abs(change_pct) > 5:
        score += 2
    elif abs(change_pct) > 3:
        score += 1
    if score >= 4:
        return "high"
    elif score >= 2:
        return "medium"
    return "low"


def call_deepseek(prompt: str) -> str:
    if not DEEPSEEK_API_KEY:
        return "未配置 DeepSeek API Key，无法提供 AI 分析。"
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": "你是一个专业的A股技术分析师。请基于提供的技术指标数据给出简洁的操作建议（200字以内），包括：1.当前趋势判断 2.关键支撑压力位 3.短期操作策略 4.风险提示。用中文回答。",
            },
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 600,
        "temperature": 0.3,
    }
    try:
        resp = requests.post(
            DEEPSEEK_BASE_URL, headers=headers, json=payload, timeout=30
        )
        data = resp.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"AI 分析请求失败: {str(e)}"


def build_ai_prompt(name: str, code: str, price: float, change_pct: float,
                    ma: dict, rsi: float, dif: float, dea: float,
                    support: float, pressure: float, trend: str,
                    risk: str) -> str:
    return f"""
股票：{name}（{code}）
最新价：{price} 元
涨跌幅：{change_pct}%
MA5：{ma.get('ma5', 'N/A')}，MA10：{ma.get('ma10', 'N/A')}，MA20：{ma.get('ma20', 'N/A')}，MA60：{ma.get('ma60', 'N/A')}
RSI(14)：{rsi}
MACD DIF：{dif}，DEA：{dea}
支撑位：{support}，压力位：{pressure}
趋势判断：{trend}
风险等级：{risk}
"""


@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "Stock AI Backend Running"})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/search", methods=["GET"])
def search():
    keyword = request.args.get("keyword", "").strip()
    if not keyword:
        return jsonify({"stocks": []})
    try:
        import akshare as ak
        df: pd.DataFrame = ak.stock_zh_a_spot_em()
        mask = df["代码"].str.contains(keyword, na=False) | df["名称"].str.contains(
            keyword, na=False
        )
        result: pd.DataFrame = df[mask].head(20)
        stocks = []
        for _, row in result.iterrows():
            code_val = str(row["代码"])
            stocks.append({
                "code": code_val,
                "name": str(row["名称"]),
                "exchange": "SH" if code_val.startswith("6") else "SZ",
            })
        return jsonify({"stocks": stocks})
    except Exception:
        stocks = []
        for code, name in _stock_names.items():
            if keyword.lower() in code.lower() or keyword in name:
                stocks.append({
                    "code": code,
                    "name": name,
                    "exchange": "SH" if code.startswith("6") else "SZ",
                })
                if len(stocks) >= 20:
                    break
        return jsonify({"stocks": stocks})


@app.route("/analyze", methods=["GET"])
def analyze():
    code = request.args.get("code", "").strip()
    if not code:
        return jsonify({"error": "请提供股票代码"}), 400
    try:
        yf_code = _to_yf_code(code)
        ticker = yf.Ticker(yf_code)
        df = ticker.history(period="6mo")

        if df.empty:
            return jsonify({"error": f"未获取到 {code} 的股票数据，请检查代码是否正确"}), 404

        df = df.reset_index()
        df.columns = [c.lower() for c in df.columns]
        col_map = {c: c for c in df.columns}
        for c in df.columns:
            if "date" in c:
                col_map[c] = "date"
        df.rename(columns=col_map, inplace=True)

        if "date" not in df.columns:
            df["date"] = df.index.astype(str)

        close = df["close"].astype(float)
        high = df["high"].astype(float)
        low = df["low"].astype(float)
        vol = df["volume"].astype(float)
        o = df["open"].astype(float)

        ma5 = calc_ma(close, 5)
        ma10 = calc_ma(close, 10)
        ma20 = calc_ma(close, 20)
        ma60 = calc_ma(close, 60)
        dif_list, dea_list, hist_list = calc_macd(close)
        rsi_list = calc_rsi(close)
        rsi_val = round(rsi_list[-1], 2) if rsi_list[-1] is not None else 0

        today_close = float(close.iloc[-1])
        prev_close = float(close.iloc[-2]) if len(close) > 1 else today_close
        change_pct = round((today_close - prev_close) / prev_close * 100, 2)

        stock_name = _get_stock_name(code)

        kline = []
        for i in range(len(df)):
            row = df.iloc[i]
            d = str(row["date"])
            if " " in d:
                d = d[:10]
            kline.append({
                "date": d,
                "open": float(o.iloc[i]),
                "close": float(close.iloc[i]),
                "high": float(high.iloc[i]),
                "low": float(low.iloc[i]),
                "volume": float(vol.iloc[i]),
            })

        # Use merged open/high/low/close for support/resistance
        df_with_ohlc = pd.DataFrame({
            "close": close, "high": high, "low": low
        })
        support, pressure = find_support_resistance(df_with_ohlc)
        trend = assess_trend(df_with_ohlc)
        risk = assess_risk(rsi_val, trend, change_pct)

        ma_latest = {
            "ma5": round(ma5[-1], 2) if ma5[-1] is not None else None,
            "ma10": round(ma10[-1], 2) if ma10[-1] is not None else None,
            "ma20": round(ma20[-1], 2) if ma20[-1] is not None else None,
            "ma60": round(ma60[-1], 2) if ma60[-1] is not None else None,
        }
        macd_latest = {
            "dif": round(dif_list[-1], 4) if dif_list[-1] is not None else 0,
            "dea": round(dea_list[-1], 4) if dea_list[-1] is not None else 0,
            "histogram": round(hist_list[-1], 4) if hist_list[-1] is not None else 0,
        }

        prompt = build_ai_prompt(
            stock_name, code, today_close, change_pct,
            ma_latest, rsi_val, macd_latest["dif"], macd_latest["dea"],
            support, pressure, trend, risk,
        )
        ai_report = call_deepseek(prompt)

        return jsonify({
            "code": code,
            "stock_name": stock_name,
            "price": today_close,
            "change_percent": change_pct,
            "volume": float(vol.iloc[-1]),
            "rsi": rsi_val,
            "ma": ma_latest,
            "macd": macd_latest,
            "support": support,
            "pressure": pressure,
            "risk_level": risk,
            "trend": trend,
            "ai_analysis": ai_report,
            "kline": kline,
            "news": [],
            "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })
    except Exception:
        traceback.print_exc()
        return jsonify({"error": traceback.format_exc()}), 500


if __name__ == "__main__":
    from waitress import serve
    port = int(os.getenv("PORT", 5000))
    print(f"Backend running on port {port}")
    serve(app, host="0.0.0.0", port=port)
