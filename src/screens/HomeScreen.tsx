import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { useStore } from '../store/useStore';
import { fetchStockAnalysis } from '../services/api';
import StockCard from '../components/StockCard';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { StockAnalysis } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const POPULAR = ['000001', '600519', '000858', '300750', '601398', '002594'];

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const watchlist = useStore((s) => s.watchlist);
  const [snapshots, setSnapshots] = useState<Record<string, Partial<StockAnalysis>>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadSnapshots = useCallback(async (codes: string[]) => {
    const results: Record<string, Partial<StockAnalysis>> = {};
    await Promise.all(
      codes.map(async (code) => {
        try {
          const d = await fetchStockAnalysis(code);
          results[code] = {
            stock_name: d.stock_name,
            price: d.price,
            change_percent: d.change_percent,
          };
        } catch {
          results[code] = { stock_name: code, price: 0, change_percent: 0 };
        }
      }),
    );
    setSnapshots((prev) => ({ ...prev, ...results }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      const codes = watchlist.length > 0 ? watchlist : POPULAR;
      loadSnapshots(codes);
    }, [watchlist, loadSnapshots]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    const codes = watchlist.length > 0 ? watchlist : POPULAR;
    await loadSnapshots(codes);
    setRefreshing(false);
  };

  const displayCodes = watchlist.length > 0 ? watchlist : POPULAR;

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }>
        {/* Header */}
        <View className="flex-row justify-between items-center py-4">
          <Text className="text-white text-2xl font-bold">Stock AI</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => nav.navigate('Search')}
              className="bg-bg-card border border-border rounded-xl px-4 py-2">
              <Text className="text-primary text-sm">搜索</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => nav.navigate('Watchlist')}
              className="bg-bg-card border border-border rounded-xl px-4 py-2">
              <Text className="text-accent text-sm">自选</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section title */}
        <Text className="text-text-secondary text-xs mb-2 mt-2">
          {watchlist.length > 0 ? '我的自选' : '热门股票（添加自选股以替换）'}
        </Text>

        {/* Stock list */}
        {displayCodes.map((code) => {
          const s = snapshots[code];
          return (
            <StockCard
              key={code}
              code={code}
              name={s?.stock_name ?? code}
              price={s?.price}
              changePercent={s?.change_percent}
              onPress={() => nav.navigate('StockDetail', { code })}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
