/**
 * @file MusicBannerCarousel.tsx
 * @description Banner Carousel vuốt ngang chuẩn thiết kế "Curated & Trending"
 * @module features/home/components
 */

import React from 'react'
import { View, Text, StyleSheet, Dimensions, FlatList, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'
import { Heart, Download } from 'lucide-react-native'
import { RADIUS, SHADOWS } from '@shared/constants/spacing'
import { COLORS } from '@shared/constants/colors'
import { GlassPlayButton } from '@shared/components/GlassPlayButton'
import { useDownloadStore } from '@features/downloads/store/downloadStore'
import { useTrackActions } from '@shared/hooks/useTrackActions'
import { useFavoriteIdsLocal, useToggleFavoriteLocal } from '@features/library/hooks/useFavorites'
import type { Track } from '@shared/types/track'

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
  /** Reference đến Track gốc để xử lý download/favorite */
  track?: Track
}

interface MusicBannerCarouselProps {
  data: BannerItem[]
  onPress?: (item: BannerItem) => void
}

export function MusicBannerCarousel({ data, onPress }: MusicBannerCarouselProps) {
  const offlineSongs = useDownloadStore((state) => state.offlineSongs)
  const { data: favoriteIds = [] } = useFavoriteIdsLocal()
  const toggleFavorite = useToggleFavoriteLocal()
  const trackActions = useTrackActions()

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
        renderItem={({ item }) => {
          // Chỉ check download/favorite status nếu có track data
          const isDownloaded = item.track ? offlineSongs.some((s) => s.id === item.track!.id) : false
          const isFavorited = item.track ? favoriteIds.includes(item.track.id) : false

          return (
          <Pressable style={styles.card} onPress={() => onPress && onPress(item)}>
            {/* Lớp 1: Thumbnail blur phủ toàn bộ — ambient color theo từng bài */}
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.bgBlur}
              blurRadius={60}
              contentFit='cover'
            />

            {/* Lớp 2: Overlay tối nhẹ để text dễ đọc */}
            <View style={styles.bgOverlay} />

            {/* Ảnh chính — chỉ chiếm 70% bên phải, blur ambient lấp đầy phần trái */}
            <View style={styles.imageContainer}>
              <MaskedView
                style={styles.maskedView}
                maskElement={
                  <LinearGradient
                    colors={['transparent', 'white']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.3, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                }
              >
                <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit='cover' />
              </MaskedView>
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

              {/* Action Buttons: Play + (Download hoặc Heart) */}
              <View style={styles.actionRow}>
                <GlassPlayButton
                  variant='outline'
                  size={44}
                  iconSize={18}
                  onPress={() => onPress?.(item)}
                />

                {/* Chỉ hiện action buttons nếu có track data */}
                {item.track && (
                  <>
                    {/* Chưa tải → hiện Download */}
                    {!isDownloaded && (
                      <Pressable onPress={() => trackActions.onDownload(item.track!)} hitSlop={8} style={styles.iconButton}>
                        <Download size={20} color='rgba(255,255,255,0.8)' />
                      </Pressable>
                    )}

                    {/* Đã tải → hiện Heart */}
                    {isDownloaded && (
                      <Pressable
                        onPress={() => toggleFavorite.mutate({ trackId: item.track!.id, isCurrentlyFavorited: isFavorited })}
                        hitSlop={8}
                        style={styles.iconButton}
                      >
                        <Heart
                          size={20}
                          color={isFavorited ? '#EF4444' : 'rgba(255,255,255,0.8)'}
                          fill={isFavorited ? '#EF4444' : 'transparent'}
                        />
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </View>
          </Pressable>
        )}}
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
    width: '60%',
  },
  maskedView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bgBlur: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.75,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 3, 22, 0.35)',
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
})
