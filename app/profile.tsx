/**
 * @file (tabs)/profile.tsx
 * @description Route cá nhân — hiển thị thông tin user, cài đặt, đăng xuất.
 * @module app/(tabs)
 */

import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@shared/components/ui/Avatar';
import { Button } from '@shared/components/ui/Button';
import { createLogger } from '@core/logger';
import { useAuth } from '@features/auth/hooks/useAuth';

const logger = createLogger('profile-screen');

/**
 * Màn hình cá nhân — hiển thị thông tin user và các tuỳ chọn.
 */
export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0A0A0A] px-6">
        <Text className="mb-2 text-xl font-bold text-[#EAEAEA]">Chưa đăng nhập</Text>
        <Text className="mb-6 text-center text-sm text-[#A0A0A0]">
          Đăng nhập để đồng bộ thư viện nhạc và playlist.
        </Text>
        <Button title="Đăng nhập" onPress={() => router.push('/auth/login')} />
      </View>
    );
  }

  const handleLogout = async () => {
    logger.info('Người dùng nhấn đăng xuất');
    await logout();
    router.replace('/auth/login');
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      {/* Header */}
      <View className="items-center px-4 pt-16">
        <Avatar imageUrl={user?.avatarUrl} name={user?.displayName ?? 'U'} size="xl" />
        <Text className="mt-4 text-xl font-bold text-[#EAEAEA]">{user?.displayName}</Text>
        <Text className="mt-1 text-sm text-[#A0A0A0]">{user?.email}</Text>
      </View>

      {/* Menu items */}
      <View className="mt-8 px-4">
        <MenuItem icon="download-outline" label="Nhạc offline" />
        <MenuItem icon="settings-outline" label="Cài đặt" />
        <MenuItem icon="help-circle-outline" label="Trợ giúp" />
        <MenuItem icon="information-circle-outline" label="Giới thiệu" />
      </View>

      {/* Nút đăng xuất */}
      <View className="mt-auto px-4 pb-32">
        <Button title="Đăng xuất" onPress={handleLogout} variant="outline" />
      </View>
    </View>
  );
}

/**
 * Một dòng menu item trong trang cá nhân.
 */
function MenuItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <Pressable className="flex-row items-center gap-4 rounded-xl py-3.5 active:bg-white/5">
      <Ionicons name={icon} size={22} color="#A0A0A0" />
      <Text className="flex-1 text-sm text-[#EAEAEA]">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#6B6B6B" />
    </Pressable>
  );
}
