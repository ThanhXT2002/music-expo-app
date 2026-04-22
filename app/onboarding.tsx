/**
 * @file onboarding.tsx
 * @description Màn hình giới thiệu ứng dụng — Liquid Glass Editorial style.
 * 3 slides với layout riêng biệt, mỗi slide tự quản lý nội dung:
 *   Slide 1: Full-bleed neon trails + bottom text (Classic Editorial)
 *   Slide 2: Glass Column split-layout (Frosted panel + exposed nebula)
 *   Slide 3: Liquid marble + massive typography (Minimalist Stack)
 * @module app
 */

import { useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  Dimensions,
  StyleSheet,
  Image,
  type ViewToken
} from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  FadeIn,
  FadeInUp,
  FadeInLeft
} from 'react-native-reanimated'
import { ArrowRight, Disc3 } from 'lucide-react-native'
import * as asyncStorage from '@core/storage/asyncStorage'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

/** Key lưu trạng thái đã xem onboarding */
export const ONBOARDING_STORAGE_KEY = 'has_seen_onboarding'

/** Slide IDs for FlatList */
const SLIDE_IDS = [{ id: '1' }, { id: '2' }, { id: '3' }]

// ─── Liquid Glass Design Tokens ───────────────────────────────────────────────

const LG = {
  surface: '#130b18',
  surfaceContainerHigh: '#261b2d',
  accentPurple: '#9333EA',
  primary: '#cc97ff',
  onSurfaceVariant: '#b4a7b9',
  glass: 'rgba(255, 255, 255, 0.10)',
  glassBorder: 'rgba(255, 255, 255, 0.20)',
  glassHeavy: 'rgba(255, 255, 255, 0.12)'
} as const

// ─── Reusable: Animated Dot ──────────────────────────────────────────────────

function AnimatedDot({ isActive }: { isActive: boolean }) {
  const progress = useSharedValue(isActive ? 1 : 0)
  progress.value = withTiming(isActive ? 1 : 0, {
    duration: 300,
    easing: Easing.out(Easing.cubic)
  })

  const animStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [6, 20]),
    opacity: interpolate(progress.value, [0, 1], [0.3, 1])
  }))

  return (
    <Animated.View
      style={[
        s.dot,
        animStyle,
        { backgroundColor: isActive ? LG.accentPurple : 'rgba(255,255,255,0.3)' },
        isActive && s.dotGlow
      ]}
    />
  )
}

function DotIndicator({ activeIndex }: { activeIndex: number }) {
  return (
    <View style={s.dotRow}>
      {SLIDE_IDS.map((_, i) => (
        <AnimatedDot key={i} isActive={i === activeIndex} />
      ))}
    </View>
  )
}

// ─── Reusable: Liquid Glass CTA Button ────────────────────────────────────────

function GlassCTA({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View style={s.ctaWrap}>
      <BlurView intensity={5} experimentalBlurMethod='dimezisBlurView' style={s.ctaBlur}>
        <Pressable onPress={onPress} style={s.ctaInner}>
          <Text style={s.ctaText}>{label}</Text>
          <ArrowRight size={18} color={'#FFFFFF'} />
        </Pressable>
      </BlurView>
    </View>
  )
}

// ─── Slide 1: Classic Editorial ───────────────────────────────────────────────

function Slide1({ insets, activeIndex, onNext }: SlideProps) {
  return (
    <View style={[s.slideBase, { width: SCREEN_WIDTH }]}>
      <Image
        source={require('../assets/images/onboarding/bg_discover.png')}
        style={s.bgImage}
        resizeMode='cover'
      />
      <LinearGradient
        colors={['transparent', `${LG.surface}40`, `${LG.surface}CC`, LG.surface]}
        locations={[0, 0.35, 0.6, 0.82]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Bottom content — only mount when active to trigger entering anims */}
      {activeIndex === 0 && (
        <View style={[s.bottomCanvas, { paddingBottom: insets.bottom + 32 }]}>
          <View style={s.textGroup}>
            <Animated.Text
              entering={FadeInUp.delay(200).duration(500).easing(Easing.out(Easing.cubic))}
              style={s.headline}
            >
              {'Âm nhạc dịch chuyển\ncùng bạn'}
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(400).duration(500).easing(Easing.out(Easing.cubic))}
              style={s.subtitle}
            >
              Nhạc nền cho mọi khoảnh khắc trong cuộc sống
            </Animated.Text>
          </View>

          <View style={s.actionArea}>
            <Animated.View entering={FadeIn.delay(600).duration(400)}>
              <DotIndicator activeIndex={activeIndex} />
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(800).duration(500).easing(Easing.out(Easing.cubic))} style={{ width: '100%' }}>
              <GlassCTA label='Tiếp tục' onPress={onNext} />
            </Animated.View>
          </View>
        </View>
      )}
    </View>
  )
}

// ─── Slide 2: Glass Column ────────────────────────────────────────────────────

function Slide2({ insets, activeIndex, onNext }: SlideProps) {
  return (
    <View style={[s.slideBase, { width: SCREEN_WIDTH }]}>
      <Image
        source={require('../assets/images/onboarding/bg_nebula.png')}
        style={s.bgImage}
        resizeMode='cover'
      />
      <LinearGradient
        colors={[`${LG.surface}4D`, 'transparent', `${LG.surface}80`]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Glass Column — Left 65% + Right 35% exposed */}
      <View style={s.glassColumnContainer}>
        <BlurView intensity={25} tint='light' experimentalBlurMethod='dimezisBlurView' style={s.glassPanel}>
          <View style={s.glassPanelTint} />

          <View style={[s.glassPanelInner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
            {/* Only mount animated content when slide is active */}
            {activeIndex === 1 ? (
              <>
                {/* Logo */}
                <Animated.View entering={FadeIn.delay(100).duration(400)} style={s.glassLogoWrap}>
                  <View style={s.glassLogoCircle}>
                    <Disc3 size={24} color={LG.primary} />
                  </View>
                </Animated.View>

                {/* Content — staggered */}
                <View style={s.glassCenterContent}>
                  <Animated.Text entering={FadeInLeft.delay(250).duration(500)} style={s.glassHeadline}>
                    {'Khám phá\nthế giới\nâm thanh'}
                  </Animated.Text>
                  <Animated.Text entering={FadeInLeft.delay(450).duration(500)} style={s.glassSubtitle}>
                    Chất lượng cao cho những tâm hồn yêu nhạc thực sự.
                  </Animated.Text>
                </View>

                {/* Dots + CTA — staggered */}
                <View style={{ gap: 24 }}>
                  <Animated.View entering={FadeIn.delay(650).duration(400)}>
                    <DotIndicator activeIndex={activeIndex} />
                  </Animated.View>
                  <Animated.View entering={FadeInUp.delay(850).duration(500).easing(Easing.out(Easing.cubic))}>
                    <GlassCTA label='Tiếp tục' onPress={onNext} />
                  </Animated.View>
                </View>
              </>
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </View>

          {/* Vertical decorative label */}
          <View style={s.verticalLabelWrap}>
            <Text style={s.verticalLabel}>MOOD / BEAT</Text>
          </View>
        </BlurView>

        {/* Right exposed area */}
        <View style={s.glassRightArea}>
          <LinearGradient
            colors={[`${LG.primary}1A`, 'transparent']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </View>
    </View>
  )
}

// ─── Slide 3: Minimalist Stack ────────────────────────────────────────────────

function Slide3({ insets, activeIndex, onFinish }: { insets: { top: number; bottom: number }; activeIndex: number; onFinish: () => void }) {
  return (
    <View style={[s.slideBase, { width: SCREEN_WIDTH }]}>
      <Image
        source={require('../assets/images/onboarding/bg_flow.png')}
        style={s.bgImage}
        resizeMode='cover'
      />
      <LinearGradient
        colors={['transparent', `${LG.surface}33`, `${LG.surface}B3`]}
        locations={[0, 0.55, 0.85]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Only mount animated content when slide is active */}
      {activeIndex === 2 && (
        <>
          {/* Dots — top left */}
          <Animated.View
            entering={FadeIn.delay(200).duration(400)}
            style={[s.pageCounter, { top: insets.top + 20 }]}
          >
            <DotIndicator activeIndex={activeIndex} />
          </Animated.View>

          {/* Bottom: massive headline + CTA — staggered */}
          <View style={[s.stackBottom, { paddingBottom: insets.bottom + 32 }]}>
            <Animated.Text
              entering={FadeInUp.delay(300).duration(600).easing(Easing.out(Easing.cubic))}
              style={s.stackHeadline}
            >
              {'NGHE\nKHÔNG\nGIỚI HẠN'}
            </Animated.Text>

            <Animated.View
              entering={FadeInUp.delay(600).duration(500).easing(Easing.out(Easing.cubic))}
              style={s.stackCtaWrap}
            >
              <GlassCTA label='Bắt đầu ngay' onPress={onFinish} />
            </Animated.View>
          </View>
        </>
      )}
    </View>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlideProps {
  insets: { top: number; bottom: number }
  activeIndex: number
  onNext: () => void
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<Animated.FlatList<(typeof SLIDE_IDS)[0]>>(null)

  const isLast = activeIndex === SLIDE_IDS.length - 1

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
    await asyncStorage.setItem(ONBOARDING_STORAGE_KEY, true)
    router.replace('/auth/login')
  }, [router])

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0)
    }
  }).current

  const renderSlide = useCallback(({ index }: { index: number }) => {
    switch (index) {
      case 0: return <Slide1 insets={insets} activeIndex={activeIndex} onNext={handleNext} />
      case 1: return <Slide2 insets={insets} activeIndex={activeIndex} onNext={handleNext} />
      case 2: return <Slide3 insets={insets} activeIndex={activeIndex} onFinish={handleFinish} />
      default: return null
    }
  }, [insets, handleNext, handleFinish, activeIndex])

  return (
    <View style={s.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDE_IDS}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        extraData={activeIndex}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Skip — always visible top-right */}
      <Animated.View
        entering={FadeIn.delay(400).duration(500)}
        style={[s.skipContainer, { top: insets.top + 16 }]}
      >
        <Pressable onPress={handleSkip} hitSlop={16} style={s.skipBtn}>
          <Text style={s.skipText}>Bỏ qua</Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const GLASS_PANEL_WIDTH = SCREEN_WIDTH * 0.65

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: LG.surface },

  // ── Shared ──
  slideBase: { flex: 1 },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.85
  },

  // ── Skip ──
  skipContainer: { position: 'absolute', right: 24, zIndex: 30 },
  skipBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  skipText: { fontSize: 14, fontWeight: '500', color: LG.onSurfaceVariant, letterSpacing: 0.5 },

  // ── Dots ──
  dotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  dot: { height: 6, borderRadius: 3 },
  dotGlow: {
    shadowColor: LG.accentPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4
  },

  // ── Unified Liquid Glass CTA ──
  ctaWrap: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LG.glassBorder
  },
  ctaBlur: { width: '100%', overflow: 'hidden', borderRadius: 9999 },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: LG.glass,
    paddingVertical: 18
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Slide 1: Classic Editorial ──
  // ─────────────────────────────────────────────────────────────────────────────

  bottomCanvas: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    zIndex: 10, paddingHorizontal: 32, alignItems: 'center'
  },
  textGroup: { alignItems: 'center', marginBottom: 48, width: '100%' },
  headline: {
    fontSize: 36, fontWeight: '800', color: '#FFFFFF',
    textAlign: 'center', lineHeight: 40, letterSpacing: -0.5, marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 24
  },
  subtitle: {
    fontSize: 16, fontWeight: '500', color: LG.onSurfaceVariant,
    textAlign: 'center', lineHeight: 24
  },
  actionArea: { alignItems: 'center', width: '100%', gap: 32 },

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Slide 2: Glass Column ──
  // ─────────────────────────────────────────────────────────────────────────────

  glassColumnContainer: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  glassPanel: {
    width: GLASS_PANEL_WIDTH, height: '100%',
    borderRightWidth: 1, borderRightColor: LG.glassBorder, overflow: 'hidden'
  },
  glassPanelTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.01)' },
  glassPanelInner: {
    flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', zIndex: 2
  },
  glassLogoWrap: { alignItems: 'flex-start' },
  glassLogoCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${LG.surfaceContainerHigh}80`,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: LG.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 6
  },
  glassCenterContent: { flex: 1, justifyContent: 'center', gap: 16 },
  glassHeadline: {
    fontSize: 36, fontWeight: '900', color: '#FFFFFF', lineHeight: 38, letterSpacing: -0.5
  },
  glassSubtitle: {
    fontSize: 14, fontWeight: '400', color: 'rgb(255,255,255)',
    lineHeight: 22, maxWidth: 200
  },
  verticalLabelWrap: {
    position: 'absolute', right: -2, top: 0, bottom: 0, width: 40,
    zIndex: 1, alignItems: 'center', justifyContent: 'center'
  },
  verticalLabel: {
    fontSize: 30, fontWeight: '900', color: LG.primary,
    letterSpacing: 6, opacity: 1,
    transform: [{ rotate: '-90deg' }],
    width: SCREEN_HEIGHT * 0.35, textAlign: 'center'
  },
  glassRightArea: { flex: 1, height: '100%' },

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Slide 3: Minimalist Stack ──
  // ─────────────────────────────────────────────────────────────────────────────

  pageCounter: { position: 'absolute', left: 24, zIndex: 10 },
  pageCounterText: {
    fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.5)', letterSpacing: 2
  },
  stackBottom: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 28, zIndex: 10
  },
  stackHeadline: {
    fontSize: 54, fontWeight: '900', color: '#FFFFFF',
    lineHeight: 58, letterSpacing: -1, marginBottom: 28,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20
  },
  stackCtaWrap: { alignItems: 'flex-end', marginBottom: 8, width: '50%', alignSelf: 'flex-end' }
})
