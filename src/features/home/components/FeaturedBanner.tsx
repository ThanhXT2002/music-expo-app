/**
 * @file FeaturedBanner.tsx
 * @description Banner nổi bật hiển thị ở đầu trang chủ — cuộn ngang.
 * @module features/home
 */

import { View, ScrollView, Pressable, Dimensions, Text } from 'react-native'

import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import type { FeaturedItem } from '../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const BANNER_WIDTH = SCREEN_WIDTH - 32

/**
 * Props của FeaturedBanner.
 */
interface FeaturedBannerProps {
  /** Danh sách item nổi bật */
  items: FeaturedItem[]
}

/**
 * FeaturedBanner — carousel banner nổi bật cuộn ngang.
 */
export function FeaturedBanner({ items }: FeaturedBannerProps) {
  const router = useRouter()

  const handlePress = (item: FeaturedItem) => {
    // Navigate tới trang chi tiết tuỳ theo loại nội dung
    if (item.type === 'track') {
      router.push(`/player/${item.targetId}`)
    } else if (item.type === 'playlist') {
      router.push(`/playlist/${item.targetId}`)
    }
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      snapToInterval={BANNER_WIDTH + 12}
      decelerationRate='fast'
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      className='mt-4'
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => handlePress(item)}
          className='overflow-hidden rounded-2xl active:opacity-90'
          style={{ width: BANNER_WIDTH }}
        >
          <Image source={{ uri: item.imageUrl }} className='h-44 w-full' contentFit='cover' transition={300} />
          {/* Gradient overlay cho text dễ đọc */}
          <View className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
            <Text className='text-lg font-bold text-white'>{item.title}</Text>
            <Text className='mt-1 text-sm text-white/70'>{item.subtitle}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  )
}
