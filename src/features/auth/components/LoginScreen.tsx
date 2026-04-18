/**
 * @file LoginScreen.tsx
 * @description Màn hình đăng nhập.
 * @module features/auth
 */

import { View, Text, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button } from '@shared/components/ui/Button';
import { createLogger } from '@core/logger';
import { useAuth } from '../hooks/useAuth';

const logger = createLogger('login-screen');

/**
 * Màn hình đăng nhập — nhập email và mật khẩu.
 */
export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setError('');
    try {
      await login({ email: email.trim(), password });
      logger.info('Đăng nhập thành công — chuyển trang');
      router.replace('/(tabs)');
    } catch {
      setError('Email hoặc mật khẩu không đúng');
      logger.warn('Đăng nhập thất bại từ UI', { email });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0A0A0A]"
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo / Tiêu đề */}
        <Text className="mb-2 text-3xl font-bold text-[#EAEAEA]">Đăng nhập</Text>
        <Text className="mb-8 text-sm text-[#A0A0A0]">Chào mừng bạn quay lại!</Text>

        {/* Email */}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#6B6B6B"
          className="mb-3 rounded-xl bg-[#1E1E2E] px-4 py-4 text-sm text-[#EAEAEA]"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Mật khẩu */}
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mật khẩu"
          placeholderTextColor="#6B6B6B"
          className="mb-4 rounded-xl bg-[#1E1E2E] px-4 py-4 text-sm text-[#EAEAEA]"
          secureTextEntry
        />

        {/* Thông báo lỗi */}
        {error ? <Text className="mb-4 text-sm text-[#F44336]">{error}</Text> : null}

        {/* Nút đăng nhập */}
        <Button title="Đăng nhập" onPress={handleLogin} loading={isLoading} />

        {/* Link đăng ký */}
        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-[#A0A0A0]">Chưa có tài khoản? </Text>
          <Text
            className="text-sm font-semibold text-[#6C63FF]"
            onPress={() => router.push('/auth/register')}
          >
            Đăng ký
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
