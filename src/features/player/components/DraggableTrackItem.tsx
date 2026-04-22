/**
 * @file DraggableTrackItem.tsx
 * @description Wrapper cho TrackListItem để hỗ trợ kéo thả (drag & drop) 
 * trong danh sách Current Playlist, tích hợp với react-native-draggable-flatlist.
 * @module features/player/components
 */

import React from 'react'
import { StyleSheet, Pressable } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Menu } from 'lucide-react-native'
import { TrackListItem } from '@shared/components/TrackListItem'
import type { Track } from '@shared/types/track'
import { COLORS } from '@shared/constants/colors'
import { SPACING } from '@shared/constants/spacing'

interface DraggableTrackItemProps {
  track: Track
  index: number
  isCurrentTrack: boolean
  onPress: (track: Track, index: number) => void
  drag: () => void
  isActive: boolean
}

/**
 * DraggableTrackItem
 * Wrapper bọc ngoài TrackListItem, cung cấp UI kéo thả khi isActive (đang được kéo).
 */
export function DraggableTrackItem({
  track,
  index,
  isCurrentTrack,
  onPress,
  drag,
  isActive
}: DraggableTrackItemProps) {
  
  // Animation khi đang kéo (phóng to nhẹ, tăng đổ bóng, giảm opacity)
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isActive ? 1.03 : 1) }],
      opacity: withSpring(isActive ? 0.8 : 1),
      zIndex: isActive ? 100 : 1,
      elevation: isActive ? 10 : 0,
      shadowOpacity: withSpring(isActive ? 0.3 : 0),
    }
  }, [isActive])

  // Nút Handle (≡ / Menu) bên phải dùng để drag
  const DragHandle = (
    <Pressable onLongPress={drag} delayLongPress={100} hitSlop={15} style={styles.dragHandle}>
      <Menu size={20} color={COLORS.textMuted} />
    </Pressable>
  )

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TrackListItem
        track={track}
        index={index + 1}
        isActive={isCurrentTrack}
        onPress={() => onPress(track, index)}
        rightIcon={DragHandle}
        // showCover={false} // Nếu muốn xài số thứ tự thay ảnh, uncomment dòng này
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  dragHandle: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
