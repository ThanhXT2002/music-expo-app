/**
 * @file ProgressBar.tsx
 * @description Thanh tiến trình phát nhạc — hiển thị thời gian hiện tại và cho phép tua.
 * @module features/player
 */

import { View, Text, Pressable } from 'react-native';
import { formatDuration } from '@shared/utils/formatDuration';

/**
 * Props của ProgressBar.
 */
interface ProgressBarProps {
  /** Tiến trình phát (0–1) */
  progress: number;
  /** Thời gian hiện tại (giây) */
  currentTime: number;
  /** Tổng thời lượng (giây) */
  duration: number;
  /** Hàm tua tới vị trí mới */
  onSeek: (position: number) => void;
}

/**
 * ProgressBar — thanh tiến trình phát nhạc.
 */
export function ProgressBar({ progress, currentTime, duration, onSeek }: ProgressBarProps) {
  // Giới hạn progress trong khoảng 0–1 để tránh lỗi hiển thị
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View className="mt-8">
      {/* Thanh progress */}
      <Pressable className="h-1.5 rounded-full bg-[#2A2A3E]">
        <View
          className="h-full rounded-full bg-[#6C63FF]"
          style={{ width: `${clampedProgress * 100}%` }}
        />
      </Pressable>

      {/* Thời gian */}
      <View className="mt-2 flex-row justify-between">
        <Text className="text-xs text-[#6B6B6B]">{formatDuration(currentTime)}</Text>
        <Text className="text-xs text-[#6B6B6B]">{formatDuration(duration)}</Text>
      </View>
    </View>
  );
}
