import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B1118',
          borderTopColor: '#18202C',
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#F5F7FB',
        tabBarInactiveTintColor: '#7C8799',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}