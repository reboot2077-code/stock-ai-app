import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { useStore } from '../store/useStore';
import { fetchStockAnalysis } from '../services/api';
import StockCard from '../components/StockCard';
import type { StockAnalysis } from '../types';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WatchlistScreen() {
  const nav = useNavigation<Nav>();
  const watchlist = useStore((s) => s.watchlist);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);
  const [snapshots, setSnapshots] = useState<Record<string, Partial<StockAnalysis>>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadSnapshots = useCallback(async () => {
    if (watchlist.length === 0) return;
    const results: Record<string, Partial<StockAnalysis>> = {};
    await Promise.all(
      watchlist.map(async (code) => {
        try {
          const d = await fetchStockAnalysis(code);
          results[code] = { stock_name: d.stock_name, price: d.price, change_percent: d.change_percent };
        } catch {
          results[code] = { stock_name: code };
        }
      }),
    );
    setSnapshots(results);
  }, [watchlist]);

  useFocusEffect(
    useCallback(() => { loadSnapshots(); }, [loadSnapshots]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSnapshots();
    setRefreshing(false);
  };

  if (watchlist.length === 0) {
    return (
      <View className="flex-1 bg-bg justify-center items-center px-8">
        <Text className="text-text-secondary text-lg mb-2">自选列表为空</Text>
        <Text className="text-text-muted text-sm text-center">
          在股票详情页或搜索页添加自选股
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <FlatList
        data={watchlist}
        keyExtractor={(item) => item}
        className="px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={({ item: code }) => {
          const s = snapshots[code];
          return (
            <StockCard
              code={code}
              name={s?.stock_name ?? code}
              price={s?.price}
              changePercent={s?.change_percent}
              onPress={() => nav.navigate('StockDetail', { code })}
            />
          );
        }}
      />
    </View>
  );
}
