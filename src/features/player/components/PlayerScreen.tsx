/**
 * @file PlayerScreen.tsx
 * @description Màn hình phát nhạc toàn màn hình.
 * Hiển thị ảnh bìa, tên bài, điều khiển phát/dừng/chuyển bài, thanh tiến trình.
 * @module features/player
 */

import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { createLogger } from '@core/logger';
import { usePlayer } from '../hooks/usePlayer';
import { ProgressBar } from './ProgressBar';
import { PlayerControls } from './PlayerControls';

const logger = createLogger('player-screen');

/**
 * Props của PlayerScreen.
 */
interface PlayerScreenProps {
  /** ID bài hát cần phát */
  trackId: string;
}

/**
 * Màn hình phát nhạc chính — hiển thị toàn màn hình.
 */
export default function PlayerScreen({ trackId }: PlayerScreenProps) {
  const { currentTrack, isPlaying, progress, currentTime, duration, play, pause, next, previous, seekTo } =
    usePlayer(trackId);

  useEffect(() => {
    logger.debug('PlayerScreen mount', { trackId });
    return () => {
      logger.debug('PlayerScreen unmount');
    };
  }, [trackId]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      logger.info('Người dùng nhấn dừng', { trackId: currentTrack?.id });
      await pause();
    } else {
      logger.info('Người dùng nhấn phát', { trackId: currentTrack?.id });
      await play();
    }
  };

  return (
    <View className="flex-1 bg-[#0A0A0A] px-6 pt-16">
      {/* Ảnh bìa bài hát */}
      <View className="items-center">
        <View className="h-72 w-72 rounded-2xl bg-[#1A1A2E]" />
      </View>

      {/* Thông tin bài hát */}
      <View className="mt-8">
        <Text className="text-xl font-bold text-[#EAEAEA]" numberOfLines={1}>
          {currentTrack?.title ?? 'Chưa chọn bài hát'}
        </Text>
        <Text className="mt-1 text-sm text-[#A0A0A0]" numberOfLines={1}>
          {currentTrack?.artist ?? '—'}
        </Text>
      </View>

      {/* Thanh tiến trình */}
      <ProgressBar progress={progress} currentTime={currentTime} duration={duration} onSeek={seekTo} />

      {/* Điều khiển phát */}
      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={next}
        onPrevious={previous}
      />
    </View>
  );
}
