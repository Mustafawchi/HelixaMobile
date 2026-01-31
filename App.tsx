import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/store';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { enableNetworkLogger } from './src/utils/networkLogger';

if (__DEV__) {
  enableNetworkLogger();
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
