export interface KLineItem {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface IndicatorValue {
  value: number | null;
  label: string;
  color?: string;
}

export interface IndicatorGroup {
  title: string;
  items: IndicatorValue[];
}

export interface StockAnalysis {
  code: string;
  stock_name: string;
  price: number;
  change_percent: number;
  volume: number;
  rsi: number;
  ma: {
    ma5: number | null;
    ma10: number | null;
    ma20: number | null;
    ma60: number | null;
  };
  macd: {
    dif: number;
    dea: number;
    histogram: number;
  };
  support: number;
  pressure: number;
  risk_level: 'low' | 'medium' | 'high';
  trend: string;
  ai_analysis: string;
  kline: KLineItem[];
  news: { title: string; url: string }[];
  update_time: string;
}

export interface StockSearchItem {
  code: string;
  name: string;
  exchange: string;
}

export interface StockSearchResult {
  stocks: StockSearchItem[];
}
