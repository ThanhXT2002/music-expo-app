/**
 * @file HomeScreen.tsx
 * @description Màn hình trang chủ — hiển thị featured banner, nghe gần đây, gợi ý.
 * @module features/home
 */

import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { createLogger } from '@core/logger';
import { useHome } from '../hooks/useHome';
import { FeaturedBanner } from './FeaturedBanner';
import { RecentlyPlayed } from './RecentlyPlayed';
import { RecommendedSection } from './RecommendedSection';

const logger = createLogger('home-screen');

/**
 * Màn hình trang chủ của ứng dụng.
 * Hiển thị banner nổi bật, bài nghe gần đây và playlist gợi ý.
 */
export default function HomeScreen() {
  const { feed, refetch } = useHome();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    logger.info('Người dùng kéo refresh trang chủ');
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <ScrollView
      className="flex-1 bg-[#0A0A0A]"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
    >
      {/* Header */}
      <View className="px-4 pb-2 pt-14">
        <Text className="text-2xl font-bold text-[#EAEAEA]">Xin chào 👋</Text>
        <Text className="mt-1 text-sm text-[#A0A0A0]">Hôm nay bạn muốn nghe gì?</Text>
      </View>

      {/* Banner nổi bật */}
      {feed?.featured && <FeaturedBanner items={feed.featured} />}

      {/* Nghe gần đây */}
      {feed?.recentlyPlayed && <RecentlyPlayed tracks={feed.recentlyPlayed} />}

      {/* Gợi ý cho bạn */}
      {feed?.recommendedPlaylists && <RecommendedSection playlists={feed.recommendedPlaylists} />}

      {/* Khoảng trống cho MiniPlayer ở dưới */}
      <View className="h-24" />
    </ScrollView>
  );
}
