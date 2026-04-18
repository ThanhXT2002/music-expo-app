/**
 * @file _layout.tsx
 * @description Root layout — bọc providers và định nghĩa routes.
 * Logic khởi tạo (splash, audio, auth) nằm trong useBootstrap.
 * @module app
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@core/api/queryClient';
import { useBootstrap } from '@core/hooks/useBootstrap';

import './global.css';

/**
 * Layout gốc — bọc QueryClientProvider.
 */
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootContent />
    </QueryClientProvider>
  );
}

/**
 * Nội dung root — chờ bootstrap xong rồi mới render routes.
 */
function RootContent() {
  const appIsReady = useBootstrap();

  if (!appIsReady) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#080316' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player/[id]" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="playlist/[id]" />
        <Stack.Screen name="playlist/create" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="auth/login" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
