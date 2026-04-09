import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="workout" />
      <Stack.Screen name="exercise" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}