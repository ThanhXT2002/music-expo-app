/**
 * @file PlayerControls.tsx
 * @description Các nút điều khiển phát nhạc: previous, play/pause, next, shuffle, repeat.
 * @module features/player
 */

import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Props của PlayerControls.
 */
interface PlayerControlsProps {
  /** Đang phát hay dừng */
  isPlaying: boolean;
  /** Hàm xử lý nhấn play/pause */
  onPlayPause: () => void;
  /** Hàm chuyển bài tiếp */
  onNext: () => void;
  /** Hàm quay lại bài trước */
  onPrevious: () => void;
}

/**
 * PlayerControls — hàng nút điều khiển phát nhạc chính.
 */
export function PlayerControls({ isPlaying, onPlayPause, onNext, onPrevious }: PlayerControlsProps) {
  return (
    <View className="mt-8 flex-row items-center justify-center gap-8">
      {/* Nút Shuffle */}
      <Pressable className="p-2 active:opacity-60">
        <Ionicons name="shuffle-outline" size={24} color="#A0A0A0" />
      </Pressable>

      {/* Nút Previous */}
      <Pressable onPress={onPrevious} className="p-2 active:opacity-60">
        <Ionicons name="play-skip-back" size={28} color="#EAEAEA" />
      </Pressable>

      {/* Nút Play/Pause — lớn nhất, nổi bật nhất */}
      <Pressable
        onPress={onPlayPause}
        className="h-16 w-16 items-center justify-center rounded-full bg-[#6C63FF] active:bg-[#4A42D4]"
      >
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#FFFFFF" />
      </Pressable>

      {/* Nút Next */}
      <Pressable onPress={onNext} className="p-2 active:opacity-60">
        <Ionicons name="play-skip-forward" size={28} color="#EAEAEA" />
      </Pressable>

      {/* Nút Repeat */}
      <Pressable className="p-2 active:opacity-60">
        <Ionicons name="repeat-outline" size={24} color="#A0A0A0" />
      </Pressable>
    </View>
  );
}
