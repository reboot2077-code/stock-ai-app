import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { searchStocks } from '../services/api';
import SearchBar from '../components/SearchBar';
import StockCard from '../components/StockCard';
import type { StockSearchItem } from '../types';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const nav = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const onSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchStocks(query.trim());
      setResults(res.stocks ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <View className="px-4 pt-4 pb-2">
        <SearchBar value={query} onChangeText={setQuery} onSubmit={onSearch} />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : searched && results.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-text-secondary text-base text-center">未找到匹配的股票</Text>
          <Text className="text-text-muted text-sm mt-2 text-center">请尝试其他关键词或股票代码</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.code}
          className="px-4 pt-2"
          renderItem={({ item }) => (
            <StockCard
              code={item.code}
              name={`${item.name} (${item.exchange})`}
              onPress={() => nav.navigate('StockDetail', { code: item.code })}
            />
          )}
        />
      )}
    </View>
  );
}
