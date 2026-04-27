import { Modal, Pressable, View, StyleSheet, Dimensions } from 'react-native'
import { ReactNode, useCallback, useEffect } from 'react'
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { RADIUS, SPACING } from '@shared/constants/spacing'
import { COLORS } from '@shared/constants/colors'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

// Snap points
const POS_HIDDEN = SCREEN_HEIGHT
const POS_HALF = SCREEN_HEIGHT * 0.5
const POS_FULL = SCREEN_HEIGHT * 0.05 // Chừa 5% cho header ở trên cùng

const SPRING_CONFIG = { damping: 28, stiffness: 280, mass: 0.9 }
const VELOCITY_THRESHOLD = 500

/**
 * Props của BottomSheet.
 */
interface BottomSheetProps {
  /** Hiển thị bottom sheet */
  visible: boolean
  /** Hàm đóng bottom sheet */
  onClose: () => void
  /** Nội dung bên trong */
  children: ReactNode
}

/**
 * BottomSheet — panel trượt lên từ dưới cùng.
 * Tích hợp Reanimated & Gesture Handler để kéo đóng mượt mà.
 * Snap points: 50% và 95% màn hình giống CurrentPlaylistSheet.
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const translateY = useSharedValue(POS_HIDDEN)
  const contextY = useSharedValue(POS_HIDDEN)

  const closeSheet = useCallback(() => {
    translateY.value = withSpring(POS_HIDDEN, SPRING_CONFIG)
    setTimeout(() => onClose(), 300)
  }, [onClose])

  useEffect(() => {
    if (visible) {
      // Mở mặc định lên 50%
      translateY.value = withSpring(POS_HALF, SPRING_CONFIG)
    } else {
      translateY.value = withSpring(POS_HIDDEN, SPRING_CONFIG)
    }
  }, [visible])

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value
    })
    .onUpdate((e) => {
      const newY = contextY.value + e.translationY
      translateY.value = Math.max(POS_FULL, Math.min(POS_HIDDEN, newY))
    })
    .onEnd((e) => {
      const currentPos = translateY.value
      const velocity = e.velocityY

      // Vuốt nhanh xuống → đóng
      if (velocity > VELOCITY_THRESHOLD) {
        if (currentPos > POS_HALF / 2) {
          translateY.value = withSpring(POS_HIDDEN, SPRING_CONFIG)
          runOnJS(closeSheet)()
        } else {
          translateY.value = withSpring(POS_HALF, SPRING_CONFIG)
        }
        return
      }

      // Vuốt nhanh lên → expand full
      if (velocity < -VELOCITY_THRESHOLD) {
        translateY.value = withSpring(POS_FULL, SPRING_CONFIG)
        return
      }

      // Snap nearest
      const distToFull = Math.abs(currentPos - POS_FULL)
      const distToHalf = Math.abs(currentPos - POS_HALF)
      const distToHidden = Math.abs(currentPos - POS_HIDDEN)

      if (distToFull <= distToHalf && distToFull <= distToHidden) {
        translateY.value = withSpring(POS_FULL, SPRING_CONFIG)
      } else if (distToHalf <= distToHidden) {
        translateY.value = withSpring(POS_HALF, SPRING_CONFIG)
      } else {
        translateY.value = withSpring(POS_HIDDEN, SPRING_CONFIG)
        runOnJS(closeSheet)()
      }
    })

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [POS_FULL, POS_HIDDEN],
      [0.6, 0],
      Extrapolation.CLAMP
    ),
  }))

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType='none' onRequestClose={closeSheet}>
      <GestureHandlerRootView style={styles.root}>
        {/* Overlay mờ — nhấn để đóng */}
        <Pressable style={StyleSheet.absoluteFillObject} onPress={closeSheet}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          <GestureDetector gesture={panGesture}>
            <View collapsable={false} style={styles.headerDragArea}>
              <View style={styles.handleBarWrapper}>
                <View style={styles.handleBar} />
              </View>
            </View>
          </GestureDetector>

          <View style={styles.contentContainer}>
            {children}
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface, // '#1A1A2E'
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    // Đổ bóng cho đẹp
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 30,
  },
  headerDragArea: {
    backgroundColor: 'transparent',
  },
  handleBarWrapper: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  handleBar: {
    height: 5,
    width: 40,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING['3xl'],
  }
})
