/**
 * @file onboarding.tsx
 * @description Màn hình giới thiệu ứng dụng — hiển thị lần đầu mở app.
 * 3 slides giới thiệu tính năng chính, nút "Bắt đầu" để chuyển sang Login.
 * @module app
 */

import { View, Pressable, Dimensions, StyleSheet, Text } from 'react-native'

import { useState, useRef, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { FlatList } from 'react-native'
import { Music, Search, Download, ChevronRight } from 'lucide-react-native'
import * as asyncStorage from '@core/storage/asyncStorage'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, SHADOWS } from '@shared/constants/spacing'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

/** Key lưu trạng thái đã xem onboarding */
export const ONBOARDING_STORAGE_KEY = 'has_seen_onboarding'

// ─── Slides data ──────────────────────────────────────────────────────────────

interface OnboardingSlide {
  id: string
  icon: any
  title: string
  description: string
  gradientColors: [string, string]
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: Music,
    title: 'Khám phá âm nhạc',
    description: 'Hàng triệu bài hát từ mọi thể loại.\nNghe nhạc không giới hạn, mọi lúc mọi nơi.',
    gradientColors: ['#6C5CE7', '#B026FF']
  },
  {
    id: '2',
    icon: Search,
    title: 'Tìm kiếm thông minh',
    description: 'Tìm bài hát bằng tên, nghệ sĩ hoặc\nnhận diện bài hát đang phát xung quanh.',
    gradientColors: ['#0984E3', '#00CEC9']
  },
  {
    id: '3',
    icon: Download,
    title: 'Nghe offline',
    description: 'Tải bài hát yêu thích về máy.\nNghe nhạc cả khi không có mạng.',
    gradientColors: ['#E84393', '#FD79A8']
  }
]

// ─── Dot Indicator ────────────────────────────────────────────────────────────

function DotIndicator({ activeIndex }: { activeIndex: number }) {
  return (
    <View style={styles.dotRow}>
      {SLIDES.map((_, i) => (
        <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
      ))}
    </View>
  )
}

// ─── Slide Item ───────────────────────────────────────────────────────────────

function SlideItem({ item }: { item: OnboardingSlide }) {
  const Icon = item.icon

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {/* Icon circle */}
      <LinearGradient
        colors={item.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.iconCircle, SHADOWS.purpleGlow]}
      >
        <Icon size={56} color='#FFFFFF' strokeWidth={1.5} />
      </LinearGradient>

      {/* Text */}
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDesc}>{item.description}</Text>
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const isLast = activeIndex === SLIDES.length - 1

  const handleNext = useCallback(() => {
    if (isLast) {
      handleFinish()
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true })
    }
  }, [activeIndex, isLast])

  const handleSkip = useCallback(() => {
    handleFinish()
  }, [])

  const handleFinish = useCallback(async () => {
    // Lưu trạng thái đã xem onboarding
    await asyncStorage.setItem(ONBOARDING_STORAGE_KEY, true)
    // Chuyển sang Login
    router.replace('/auth/login')
  }, [router])

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0)
    }
  }).current

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F0C29', '#1a1240', '#120d20']} style={StyleSheet.absoluteFillObject} />

      {/* Skip button */}
      <Pressable onPress={handleSkip} style={[styles.skipBtn, { top: insets.top + SPACING.md }]} hitSlop={12}>
        <Text style={styles.skipText}>Bỏ qua</Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SlideItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={styles.flatList}
      />

      {/* Bottom section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + SPACING['2xl'] }]}>
        {/* Dots */}
        <DotIndicator activeIndex={activeIndex} />

        {/* Next / Get Started button */}
        <Pressable onPress={handleNext} style={styles.nextBtnWrap}>
          <LinearGradient
            colors={['#B026FF', '#6C5CE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.nextBtn, SHADOWS.purpleGlow]}
          >
            {isLast ? (
              <Text style={styles.nextBtnText}>Bắt đầu ngay</Text>
            ) : (
              <>
                <Text style={styles.nextBtnText}>Tiếp tục</Text>
                <ChevronRight size={20} color='#FFFFFF' />
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  skipBtn: {
    position: 'absolute',
    right: SPACING.lg,
    zIndex: 10,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    fontWeight: '500'
  },

  // Slides
  flatList: {
    flex: 1
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['3xl']
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['4xl']
  },
  slideTitle: {
    fontSize: FONT_SIZE['3xl'],
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: SPACING.lg
  },
  slideDesc: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24
  },

  // Bottom
  bottomSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    gap: SPACING['2xl']
  },

  // Dots
  dotRow: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.primary
  },

  // Button
  nextBtnWrap: {
    width: '100%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden'
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    gap: SPACING.sm
  },
  nextBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#FFFFFF'
  }
})
