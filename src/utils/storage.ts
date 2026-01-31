import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getString: async (key: string): Promise<string | null> => {
    return AsyncStorage.getItem(key);
  },
  set: async (key: string, value: string): Promise<void> => {
    return AsyncStorage.setItem(key, value);
  },
  remove: async (key: string): Promise<void> => {
    return AsyncStorage.removeItem(key);
  },
  clearAll: async (): Promise<void> => {
    return AsyncStorage.clear();
  },
};
