/**
 * @file MiniPlayer.tsx
 * @description Trình phát nhạc thu nhỏ — hiển thị cố định ở dưới cùng màn hình.
 * Nhấn để mở PlayerScreen toàn màn hình.
 * @module features/player
 */

import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '../store/playerStore';
import { usePlayer } from '../hooks/usePlayer';

/**
 * MiniPlayer — thanh phát nhạc nhỏ nổi ở dưới cùng.
 * Chỉ hiển thị khi đang có bài hát được chọn.
 */
export function MiniPlayer() {
  const { currentTrack } = usePlayerStore();
  const { isPlaying, play, pause } = usePlayer();
  const router = useRouter();

  // Không hiển thị nếu chưa có bài hát nào
  if (!currentTrack) return null;

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/player/${currentTrack.id}`)}
      className="absolute bottom-20 left-2 right-2 flex-row items-center gap-3 rounded-2xl bg-[#1A1A2E] p-3"
    >
      {/* Ảnh bìa nhỏ */}
      <Image
        source={{ uri: currentTrack.coverUrl }}
        className="h-10 w-10 rounded-lg"
        contentFit="cover"
      />

      {/* Thông tin bài hát */}
      <View className="flex-1">
        <Text className="text-sm font-semibold text-[#EAEAEA]" numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text className="text-xs text-[#A0A0A0]" numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      {/* Nút play/pause */}
      <Pressable onPress={handlePlayPause} className="p-2">
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={24}
          color="#EAEAEA"
        />
      </Pressable>
    </Pressable>
  );
}
