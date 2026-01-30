import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
// import MainTabs from './MainTabs';

export default function RootNavigator() {
  // TODO: Auth state'e gore AuthStack veya MainTabs goster
  const isAuthenticated = false;

  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
}
