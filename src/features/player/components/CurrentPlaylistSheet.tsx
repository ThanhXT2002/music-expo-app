/**
 * @file CurrentPlaylistSheet.tsx
 * @description Bottom Sheet hiển thị danh sách bài hát đang chờ phát (queue).
 * Hỗ trợ gesture kéo — snap tại 50% và 95% chiều cao màn hình (giống Spotify).
 * Dùng Modal để tách layer khỏi PlayerScreen (tránh bị đĩa than đè).
 * @module features/player/components
 */

import React, { useCallback, useEffect } from 'react'
import { View, StyleSheet, Dimensions, Pressable, Modal, StatusBar } from 'react-native'
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import DraggableFlatList, { RenderItemParams, DragEndParams } from 'react-native-draggable-flatlist'
import { Download } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PlaylistHeader } from './PlaylistHeader'
import { DraggableTrackItem } from './DraggableTrackItem'
import { useCurrentPlaylist } from '../hooks/useCurrentPlaylist'
import { usePlayerStore } from '../store/playerStore'
import { EmptyState } from '@shared/components/EmptyState'
import { COLORS } from '@shared/constants/colors'
import { RADIUS, SPACING } from '@shared/constants/spacing'
import type { Track } from '@shared/types/track'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

// ─── Snap Points ──────────────────────────────────────────────────────────────
// 2 mức giống Spotify: half (50%) và full (95%)
const SNAP_HALF = SCREEN_HEIGHT * 0.5
const SNAP_FULL = SCREEN_HEIGHT * 0.95

// translateY tính từ đáy màn hình lên:
// translateY = 0 → sheet ở đáy (ẩn hoàn toàn)
// translateY = -SNAP_HALF → sheet chiếm 50%
// translateY = -SNAP_FULL → sheet chiếm 95%
const POS_HIDDEN = 0
const POS_HALF = -SNAP_HALF
const POS_FULL = -SNAP_FULL

// Ngưỡng kéo để chuyển snap
const VELOCITY_THRESHOLD = 500

const SPRING_CONFIG = { damping: 28, stiffness: 280, mass: 0.9 }

/**
 * Bottom Sheet cho Danh sách phát hiện tại.
 * 2 snap points: 50% và 95% chiều cao.
 * Kéo xuống quá 50% → đóng. Kéo lên → expand lên 95%.
 */
export function CurrentPlaylistSheet() {
  const insets = useSafeAreaInsets()
  const store = usePlayerStore()
  const isVisible = store.showCurrentPlaylist

  const {
    queue,
    currentTrack,
    currentIndex,
    isPlaying,
    shuffleEnabled,
    progressPercentage,
    remainingTimeText,
    playSongAtIndex,
    reorderQueue,
    togglePlayPause,
    next,
    previous,
    toggleShuffle,
  } = useCurrentPlaylist()

  // translateY: vị trí sheet (negative = hiện lên)
  const translateY = useSharedValue(POS_HIDDEN)
  // Lưu vị trí trước khi bắt đầu gesture
  const contextY = useSharedValue(POS_HIDDEN)

  const closeSheet = useCallback(() => {
    translateY.value = withSpring(POS_HIDDEN, SPRING_CONFIG)
    setTimeout(() => store.closeCurrentPlaylist(), 300)
  }, [store])

  // Khi mở → snap tới 50%
  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(POS_HALF, SPRING_CONFIG)
    } else {
      translateY.value = POS_HIDDEN
    }
  }, [isVisible])

  // ─── Pan Gesture ─────────────────────────────────────────────────────────
  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value
    })
    .onUpdate((e) => {
      // Giới hạn: không kéo lên quá POS_FULL, không kéo xuống quá POS_HIDDEN
      const newY = contextY.value + e.translationY
      translateY.value = Math.max(POS_FULL, Math.min(POS_HIDDEN, newY))
    })
    .onEnd((e) => {
      const currentPos = translateY.value
      const velocity = e.velocityY

      // Vuốt nhanh xuống → đóng
      if (velocity > VELOCITY_THRESHOLD) {
        if (currentPos > POS_HALF / 2) {
          // Đang ở gần half hoặc thấp hơn → đóng
          translateY.value = withSpring(POS_HIDDEN, SPRING_CONFIG)
          runOnJS(closeSheet)()
        } else {
          // Đang ở full → snap về half
          translateY.value = withSpring(POS_HALF, SPRING_CONFIG)
        }
        return
      }

      // Vuốt nhanh lên → expand full
      if (velocity < -VELOCITY_THRESHOLD) {
        translateY.value = withSpring(POS_FULL, SPRING_CONFIG)
        return
      }

      // Snap dựa trên vị trí hiện tại (nearest snap point)
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

  // ─── Animated Styles ──────────────────────────────────────────────────────
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [POS_HIDDEN, POS_HALF, POS_FULL],
      [0, 0.5, 0.7],
      Extrapolation.CLAMP
    ),
  }))

  if (!isVisible) return null

  // ─── List rendering ─────────────────────────────────────────────────────
  const handleDragEnd = ({ data, from, to }: DragEndParams<Track>) => {
    if (from !== to) reorderQueue(from, to)
  }

  const renderItem = ({ item, getIndex, drag, isActive }: RenderItemParams<Track>) => {
    const index = getIndex() ?? 0
    const isCurrentTrack = currentTrack?.id === item.id
    return (
      <DraggableTrackItem
        track={item}
        index={index}
        isCurrentTrack={isCurrentTrack}
        onPress={playSongAtIndex}
        drag={drag}
        isActive={isActive}
      />
    )
  }

  return (
    <Modal visible={isVisible} transparent animationType='none' onRequestClose={closeSheet} statusBarTranslucent>
      <GestureHandlerRootView style={styles.root}>
        {/* Backdrop tối mờ — bấm để đóng */}
        <Pressable style={StyleSheet.absoluteFillObject} onPress={closeSheet}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        {/* Sheet — vị trí ban đầu ở dưới đáy, animate lên */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, sheetStyle]}>
            {/* Handle bar — vùng kéo */}
            <View style={styles.handleArea}>
              <View style={styles.handleBar} />
            </View>

            {/* Header — playlist info + controls */}
            <PlaylistHeader
              currentTrack={currentTrack}
              totalTracks={queue.length}
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              shuffleEnabled={shuffleEnabled}
              progressPercentage={progressPercentage}
              remainingTimeText={remainingTimeText}
              onPrevious={previous}
              onPlayPause={togglePlayPause}
              onNext={next}
              onShuffle={toggleShuffle}
              headerActions={
                <Pressable hitSlop={12} style={{ padding: 4, marginRight: 4 }}>
                  {/* Icon Tải xuống (giả lập) giống hệt web */}
                  <Download size={20} color="#FFFFFF" />
                </Pressable>
              }
            />

            {/* Danh sách bài hát — kéo thả được */}
            <View style={[styles.listContainer, { paddingBottom: insets.bottom }]}>
              {queue.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <EmptyState
                    icon='list-outline'
                    title='Danh sách phát trống'
                    description='Hãy thêm bài hát vào danh sách phát để bắt đầu thưởng thức.'
                  />
                </View>
              ) : (
                <DraggableFlatList
                  data={queue}
                  onDragEnd={handleDragEnd}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  contentContainerStyle={styles.flatListContent}
                  showsVerticalScrollIndicator={false}
                  activationDistance={5}
                />
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    top: SCREEN_HEIGHT, // Bắt đầu ở dưới màn hình
    left: 0,
    right: 0,
    height: SNAP_FULL + 40, // Cao hơn một chút để không thấy đáy khi kéo
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 30,
  },
  handleArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flatListContent: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING['3xl'],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
})
