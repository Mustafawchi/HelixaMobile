import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ReportListScreen from '../screens/reports/ReportListScreen';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Reports" component={ReportListScreen} />
    </Tab.Navigator>
  );
}
