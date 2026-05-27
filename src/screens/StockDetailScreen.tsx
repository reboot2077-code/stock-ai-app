import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { Colors } from '../constants/colors';
import { useStore } from '../store/useStore';
import { fetchStockAnalysis } from '../services/api';
import KLineChart from '../components/KLineChart';
import IndicatorRow from '../components/IndicatorRow';
import type { StockAnalysis } from '../types';
import type { RootStackParamList } from '../navigation/AppNavigator';

type DetailRoute = RouteProp<RootStackParamList, 'StockDetail'>;

export default function StockDetailScreen() {
  const route = useRoute<DetailRoute>();
  const nav = useNavigation();
  const { code } = route.params;
  const [data, setData] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInWatchlist = useStore((s) => s.isInWatchlist(code));
  const addToWatchlist = useStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchStockAnalysis(code)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? '加载失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [code]);

  if (loading) {
    return (
      <View className="flex-1 bg-bg justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-text-secondary mt-4">加载中...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 bg-bg justify-center items-center px-8">
        <Text className="text-danger text-lg mb-2">加载失败</Text>
        <Text className="text-text-secondary text-center">{error ?? '未知错误'}</Text>
        <TouchableOpacity
          onPress={() => nav.goBack()}
          className="mt-6 bg-primary rounded-xl px-6 py-3">
          <Text className="text-white">返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isRise = data.change_percent >= 0;
  const pctColor = isRise ? Colors.rise : Colors.fall;
  const riskColors: Record<string, string> = {
    low: Colors.accentGreen,
    medium: Colors.warning,
    high: Colors.danger,
  };

  const indicators = [
    { label: 'RSI(14)', value: data.rsi?.toFixed(1) ?? '-', color: data.rsi > 70 ? Colors.danger : data.rsi < 30 ? Colors.accentGreen : Colors.accent },
    { label: '趋势', value: data.trend, color: data.trend.includes('上涨') ? Colors.rise : data.trend.includes('下跌') ? Colors.fall : Colors.warning },
    { label: '风险', value: { low: '低', medium: '中', high: '高' }[data.risk_level] ?? '-', color: riskColors[data.risk_level] ?? Colors.textSecondary },
    { label: 'MA5', value: data.ma.ma5?.toFixed(2) ?? '-' },
    { label: 'MA10', value: data.ma.ma10?.toFixed(2) ?? '-' },
    { label: 'MA20', value: data.ma.ma20?.toFixed(2) ?? '-' },
    { label: '支撑位', value: data.support.toFixed(2), color: Colors.accentGreen },
    { label: '压力位', value: data.pressure.toFixed(2), color: Colors.danger },
  ];

  const klineData = data.kline ?? [];
  const n = klineData.length;
  const ma5Line = klineData.map((_, i) => {
    if (i < 4) return null;
    const slice = klineData.slice(i - 4, i + 1);
    return slice.reduce((s, k) => s + k.close, 0) / 5;
  });
  const ma10Line = klineData.map((_, i) => {
    if (i < 9) return null;
    const slice = klineData.slice(i - 9, i + 1);
    return slice.reduce((s, k) => s + k.close, 0) / 10;
  });
  const ma20Line = klineData.map((_, i) => {
    if (i < 19) return null;
    const slice = klineData.slice(i - 19, i + 1);
    return slice.reduce((s, k) => s + k.close, 0) / 20;
  });
  const ma60Line = klineData.map((_, i) => {
    if (i < 59) return null;
    const slice = klineData.slice(i - 59, i + 1);
    return slice.reduce((s, k) => s + k.close, 0) / 60;
  });

  return (
    <ScrollView className="flex-1 bg-bg">
      {/* Price header */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-text-secondary text-sm">{data.stock_name}</Text>
            <Text className="text-text-muted text-xs">{data.code}</Text>
          </View>
          <View className="items-end">
            <Text className="text-white text-3xl font-bold">{data.price.toFixed(2)}</Text>
            <Text style={{ color: pctColor }} className="text-lg font-bold mt-0.5">
              {isRise ? '+' : ''}{data.change_percent.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Watchlist button */}
        <TouchableOpacity
          onPress={() => isInWatchlist ? removeFromWatchlist(code) : addToWatchlist(code)}
          className={`mt-3 py-2 rounded-lg items-center border ${isInWatchlist ? 'bg-danger/20 border-danger' : 'bg-primary/20 border-primary'}`}>
          <Text style={{ color: isInWatchlist ? Colors.danger : Colors.primary }} className="text-sm font-medium">
            {isInWatchlist ? '移出自选' : '加入自选'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Indicator row */}
      <View className="px-4 mb-3">
        <IndicatorRow items={indicators} />
      </View>

      {/* K-line chart */}
      {klineData.length > 0 ? (
        <View className="mb-4">
          <KLineChart data={klineData} ma5={ma5Line} ma10={ma10Line} ma20={ma20Line} ma60={ma60Line} />
        </View>
      ) : (
        <Text className="text-text-muted text-center py-8">暂无K线数据</Text>
      )}

      {/* AI Analysis */}
      <View className="px-4 pb-8">
        <Text className="text-white text-lg font-bold mb-3">AI 分析报告</Text>
        <View className="bg-bg-card rounded-xl p-4 border border-border">
          <Text className="text-text-secondary text-sm leading-6">{data.ai_analysis}</Text>
        </View>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
