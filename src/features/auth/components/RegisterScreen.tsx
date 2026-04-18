/**
 * @file RegisterScreen.tsx
 * @description Màn hình đăng ký tài khoản.
 * @module features/auth
 */

import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button } from '@shared/components/ui/Button';
import { createLogger } from '@core/logger';
import { useAuth } from '../hooks/useAuth';

const logger = createLogger('register-screen');

/**
 * Màn hình đăng ký tài khoản mới.
 */
export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    // Validate form
    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setError('');
    try {
      await register({ displayName: displayName.trim(), email: email.trim(), password, confirmPassword });
      logger.info('Đăng ký thành công — chuyển trang');
      router.replace('/(tabs)');
    } catch {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
      logger.warn('Đăng ký thất bại từ UI', { email });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0A0A0A]"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ justifyContent: 'center', padding: 24 }}>
        <Text className="mb-2 text-3xl font-bold text-[#EAEAEA]">Đăng ký</Text>
        <Text className="mb-8 text-sm text-[#A0A0A0]">Tạo tài khoản để bắt đầu nghe nhạc!</Text>

        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Tên hiển thị"
          placeholderTextColor="#6B6B6B"
          className="mb-3 rounded-xl bg-[#1E1E2E] px-4 py-4 text-sm text-[#EAEAEA]"
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#6B6B6B"
          className="mb-3 rounded-xl bg-[#1E1E2E] px-4 py-4 text-sm text-[#EAEAEA]"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mật khẩu"
          placeholderTextColor="#6B6B6B"
          className="mb-3 rounded-xl bg-[#1E1E2E] px-4 py-4 text-sm text-[#EAEAEA]"
          secureTextEntry
        />

        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Xác nhận mật khẩu"
          placeholderTextColor="#6B6B6B"
          className="mb-4 rounded-xl bg-[#1E1E2E] px-4 py-4 text-sm text-[#EAEAEA]"
          secureTextEntry
        />

        {error ? <Text className="mb-4 text-sm text-[#F44336]">{error}</Text> : null}

        <Button title="Đăng ký" onPress={handleRegister} loading={isLoading} />

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-[#A0A0A0]">Đã có tài khoản? </Text>
          <Text
            className="text-sm font-semibold text-[#6C63FF]"
            onPress={() => router.back()}
          >
            Đăng nhập
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
