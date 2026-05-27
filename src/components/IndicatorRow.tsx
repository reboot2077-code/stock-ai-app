import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../constants/colors';

interface IndicatorItem {
  label: string;
  value: string | number;
  color?: string;
}

interface Props {
  items: IndicatorItem[];
}

export default function IndicatorRow({ items }: Props) {
  return (
    <View className="flex-row flex-wrap bg-bg-card rounded-xl p-3 border border-border">
      {items.map((item, i) => (
        <View key={i} className="w-1/4 py-2 items-center">
          <Text className="text-text-muted text-[10px] mb-1">{item.label}</Text>
          <Text
            className="text-sm font-bold"
            style={{ color: item.color || Colors.textPrimary }}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
