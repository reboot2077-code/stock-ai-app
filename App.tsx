import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import { Colors } from './src/constants/colors';
import './global.css';

export default function App() {
  const loadWatchlist = useStore((s) => s.loadWatchlist);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor={Colors.bg} />
        <AppNavigator />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});
