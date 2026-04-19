/**
 * @file _layout.tsx
 * @description Root layout — bọc providers, auth guard và định nghĩa routes.
 *
 * Luồng hoạt động:
 * 1. Bootstrap chạy: Splash hiện, restore session từ SecureStorage
 * 2. isReady = true: Splash ẩn, kiểm tra user
 *    - Có user → vào (tabs)
 *    - Không có user → redirect /auth/login
 *
 * @module app
 */

import { Stack, Redirect, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { queryClient } from '@core/api/queryClient';
import { useBootstrap } from '@core/hooks/useBootstrap';
import { useAuthStore } from '@features/auth/store/authStore';
import { COLORS } from '@shared/constants/colors';

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
 * Nội dung root — auth guard + route definitions.
 *
 * Chỉ subscribe 2 field nhỏ nhất từ authStore (user, isReady)
 * để tránh re-render không cần thiết.
 */
function RootContent() {
  // Bootstrap: restore session, init audio, hide splash
  useBootstrap();

  // Subscribe vào auth state — chỉ lấy 2 field cần thiết
  const isReady = useAuthStore((s) => s.isReady);
  const user = useAuthStore((s) => s.user);
  const segments = useSegments();

  // ── Đang kiểm tra session → giữ màn hình loading tối ──
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ── Auth Guard ──
  // Kiểm tra user đang ở nhóm route nào
  const inAuthGroup = segments[0] === 'auth';

  // Chưa đăng nhập + không ở trang auth → redirect sang login
  if (!user && !inAuthGroup) {
    return (
      <View style={styles.rootContainer}>
        <StatusBar style="light" />
        <Redirect href="/auth/login" />
      </View>
    );
  }

  // Đã đăng nhập + đang ở trang auth → redirect về trang chủ
  if (user && inAuthGroup) {
    return (
      <View style={styles.rootContainer}>
        <StatusBar style="light" />
        <Redirect href="/(tabs)" />
      </View>
    );
  }

  // ── Bình thường: render routes ──
  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player/[id]" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="playlist/[id]" />
        <Stack.Screen name="playlist/create" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="auth/login" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/verify-email" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
