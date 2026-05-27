import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, onSubmit, placeholder = '搜索股票代码或名称' }: Props) {
  return (
    <View className="flex-row items-center bg-bg-input rounded-xl px-4 h-12 border border-border">
      <TextInput
        className="flex-1 text-white text-base h-full"
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} className="mr-2">
          <Text className="text-text-muted text-lg">x</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onSubmit} className="bg-primary rounded-lg px-4 py-1.5">
        <Text className="text-white text-sm font-medium">搜索</Text>
      </TouchableOpacity>
    </View>
  );
}
