import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  code: string;
  name: string;
  price?: number;
  changePercent?: number;
  onPress: () => void;
}

export default function StockCard({ code, name, price, changePercent, onPress }: Props) {
  const isRise = (changePercent ?? 0) >= 0;
  const pctColor = isRise ? Colors.rise : Colors.fall;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-bg-card rounded-xl p-4 mb-3 border border-border"
      activeOpacity={0.7}>
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white text-base font-bold">{name}</Text>
          <Text className="text-text-muted text-xs mt-0.5">{code}</Text>
        </View>
        <View className="items-end">
          {price != null ? (
            <Text className="text-white text-lg font-bold">{price.toFixed(2)}</Text>
          ) : (
            <Text className="text-text-muted text-sm">加载中</Text>
          )}
          {changePercent != null && (
            <Text style={{ color: pctColor }} className="text-sm mt-0.5 font-medium">
              {isRise ? '+' : ''}{changePercent.toFixed(2)}%
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
