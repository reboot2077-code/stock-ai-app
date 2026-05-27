import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import StockDetailScreen from '../screens/StockDetailScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import { Colors } from '../constants/colors';

export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  StockDetail: { code: string };
  Watchlist: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bg },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: { fontSize: 16, fontWeight: '600' },
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'slide_from_right',
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: '搜索股票' }}
        />
        <Stack.Screen
          name="StockDetail"
          component={StockDetailScreen}
          options={{ title: '股票详情' }}
        />
        <Stack.Screen
          name="Watchlist"
          component={WatchlistScreen}
          options={{ title: '我的自选' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
