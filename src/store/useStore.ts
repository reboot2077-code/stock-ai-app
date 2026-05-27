import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@watchlist';

interface AppState {
  watchlist: string[];
  addToWatchlist: (code: string) => void;
  removeFromWatchlist: (code: string) => void;
  isInWatchlist: (code: string) => boolean;
  loadWatchlist: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  watchlist: [],

  addToWatchlist: (code: string) => {
    const list = get().watchlist;
    if (list.includes(code)) return;
    const next = [...list, code];
    set({ watchlist: next });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  removeFromWatchlist: (code: string) => {
    const next = get().watchlist.filter((c) => c !== code);
    set({ watchlist: next });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  isInWatchlist: (code: string) => get().watchlist.includes(code),

  loadWatchlist: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ watchlist: JSON.parse(raw) });
    } catch {
      // ignore
    }
  },
}));
