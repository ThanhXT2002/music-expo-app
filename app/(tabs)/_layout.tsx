/**
 * @file (tabs)/_layout.tsx
 * @description Tab navigator layout — 4 tab chính: Home, Search, Library, Profile.
 * @module app/(tabs)
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MiniPlayer } from '@features/player/components/MiniPlayer';
import { View } from 'react-native';

/**
 * Layout cho tab navigation.
 * Hiển thị MiniPlayer nổi phía trên tab bar.
 */
export default function TabLayout() {
  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0A0A0A',
            borderTopColor: '#2A2A3E',
            borderTopWidth: 0.5,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#6B6B6B',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Tìm kiếm',
            tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Thư viện',
            tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Cá nhân',
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />
      </Tabs>

      {/* MiniPlayer nổi phía trên tab bar */}
      <MiniPlayer />
    </View>
  );
}
