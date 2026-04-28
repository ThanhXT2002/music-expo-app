/**
 * @file SpinningDisc.tsx
 * @description Component đĩa than xoay tròn — tái sử dụng ở PlayerScreen và TabBar Mini Player.
 *
 * Khi isPlaying = true, thumbnail xoay liên tục (mỗi vòng 8s).
 * Khi dừng, giữ nguyên vị trí góc quay hiện tại.
 *
 * @module shared/components
 */

import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing
} from 'react-native-reanimated'
import { Image } from 'expo-image'

// ─── Props ───────────────────────────────────────────────────────────────────

interface SpinningDiscProps {
  /** URL ảnh thumbnail */
  uri: string
  /** Trạng thái phát nhạc — true = xoay, false = dừng */
  isPlaying: boolean
  /** Đường kính đĩa (px) */
  size: number
  /** Hiển thị lỗ đĩa than ở giữa — true cho PlayerScreen, false cho Mini Player */
  showHole?: boolean
  /** Hiển thị shadow glow phía sau — mặc định true */
  showGlow?: boolean
}

/**
 * Đĩa than xoay tròn với thumbnail ở giữa.
 * Tái sử dụng cho cả PlayerScreen (lớn) và TabBar Mini Player (nhỏ).
 */
export function SpinningDisc({
  uri,
  isPlaying,
  size,
  showHole = true,
  showGlow = true
}: SpinningDiscProps) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (isPlaying) {
      // Xoay liên tục vô hạn, mỗi vòng 8 giây (360 độ)
      rotation.value = withRepeat(
        withTiming(rotation.value + 360, {
          duration: 8000,
          easing: Easing.linear
        }),
        -1,
        false
      )
    } else {
      // Dừng ngay lập tức (giữ nguyên vị trí)
      cancelAnimation(rotation)
    }
  }, [isPlaying, rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }))

  const holeSize = Math.max(size * 0.18, 12)

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Shadow glow */}
      {showGlow && (
        <View style={[styles.glow, { width: size + 20, height: size + 20 }]} />
      )}

      <Reanimated.View
        style={[
          styles.disc,
          { width: size, height: size, borderRadius: size / 2 },
          animatedStyle
        ]}
      >
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit='cover'
          transition={400}
        />

        {/* Lỗ đĩa than ở giữa */}
        {showHole && (
          <View
            style={[
              styles.hole,
              {
                width: holeSize,
                height: holeSize,
                borderRadius: holeSize / 2
              }
            ]}
          />
        )}
      </Reanimated.View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(176, 38, 255, 0.12)',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden'
  },
  image: {
    position: 'absolute'
  },
  hole: {
    backgroundColor: '#1A1030',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 2
  }
})
