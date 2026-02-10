import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./src/store";
import { AuthProvider } from "./src/context/AuthContext";
import { BiometricProvider } from "./src/context/BiometricContext";
import { useAuth } from "./src/hooks/useAuth";
import RootNavigator from "./src/navigation/RootNavigator";
import { enableNetworkLogger } from "./src/utils/networkLogger";

if (__DEV__) {
  enableNetworkLogger();
}

function AppInner() {
  const { isAuthenticated } = useAuth();

  return (
    <BiometricProvider isAuthenticated={isAuthenticated}>
      <RootNavigator />
    </BiometricProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </QueryClientProvider>
  );
}
