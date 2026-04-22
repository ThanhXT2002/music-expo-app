/**
 * @file MusicBannerCarousel.tsx
 * @description Banner Carousel vuốt ngang chuẩn thiết kế "Curated & Trending"
 * @module features/home/components
 */

import React from 'react'
import { View, Text, StyleSheet, Dimensions, FlatList, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '@shared/constants/colors'
import { RADIUS, SHADOWS } from '@shared/constants/spacing'
import { MediaActionButtons } from '@shared/components/MediaActionButtons'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Kích thước dạng thẻ ngang chữ nhật
const ITEM_WIDTH = SCREEN_WIDTH * 0.85
const ITEM_HEIGHT = 170
const SPACING = 16

export interface BannerItem {
  id: string
  title: string
  subtitle: string
  imageUrl: string
}

interface MusicBannerCarouselProps {
  data: BannerItem[]
  onPress?: (item: BannerItem) => void
}

export function MusicBannerCarousel({ data, onPress }: MusicBannerCarouselProps) {
  if (!data || data.length === 0) return null
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate='fast'
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onPress && onPress(item)}>
            {/* Background Gradient — deep purple chéo */}
            <LinearGradient
              colors={[COLORS.background, COLORS.secondary, '#1e3a5f']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Ảnh bên phải */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit='cover' />
              {/* Overlay mờ dần — đồng tông deep purple để hòa trộn mượt */}
              <LinearGradient
                colors={[COLORS.secondary, `${COLORS.secondary}80`, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.65, y: 0 }}
                locations={[0, 0.25, 0.65]}
                style={StyleSheet.absoluteFillObject}
              />
            </View>

            {/* Nội dung Text & Nút */}
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>

              <MediaActionButtons
                variant='inline'
                onPlay={() => onPress?.(item)}
              />
            </View>
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    marginVertical: 12
  },
  listContent: {
    paddingHorizontal: SPACING,
    gap: SPACING
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    flexDirection: 'row',
    ...SHADOWS.card
  },
  imageContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '60%' // Chiếm 60% bên phải
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.9
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    zIndex: 10
  },
  textContainer: {
    width: '75%', // Giới hạn text không đè lên phần ảnh quá nhiều
    gap: 6
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
    fontWeight: '400'
  },
})
