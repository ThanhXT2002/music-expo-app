/**
 * @file TrackListItem.tsx
 * @description Track item dạng list — dùng cho playlist detail, album detail, downloads.
 * Khác TrackCard (horizontal scroll card) — đây là dạng full-width list row.
 * @module shared/components
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MoreVertical } from 'lucide-react-native';
import { COLORS } from '@shared/constants/colors';
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing';
import { formatDuration } from '@shared/utils/formatDuration';
import type { Track } from '@shared/types/track';

interface TrackListItemProps {
  /** Thông tin bài hát */
  track: Track;
  /** Số thứ tự (hiển thị thay ảnh nếu muốn) */
  index?: number;
  /** Hiển thị ảnh bìa (mặc định true) */
  showCover?: boolean;
  /** Callback khi nhấn vào track */
  onPress: (track: Track) => void;
  /** Callback khi nhấn menu "..." */
  onMenuPress?: (track: Track) => void;
  /** Track này đang active (đang phát) */
  isActive?: boolean;
}

/**
 * TrackListItem — hàng bài hát trong danh sách.
 */
export function TrackListItem({
  track,
  index,
  showCover = true,
  onPress,
  onMenuPress,
  isActive = false,
}: TrackListItemProps) {
  return (
    <Pressable
      onPress={() => onPress(track)}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isActive && styles.active,
      ]}
    >
      {/* Số thứ tự hoặc ảnh bìa */}
      {showCover ? (
        <Image
          source={{ uri: track.coverUrl }}
          style={styles.cover}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.indexContainer}>
          <Text style={[styles.indexText, isActive && { color: COLORS.primary }]}>
            {index ?? '—'}
          </Text>
        </View>
      )}

      {/* Thông tin bài hát */}
      <View style={styles.info}>
        <Text
          style={[styles.title, isActive && { color: COLORS.primary }]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>

      {/* Thời lượng */}
      <Text style={styles.duration}>{formatDuration(track.durationSeconds)}</Text>

      {/* Menu button */}
      {onMenuPress && (
        <Pressable
          onPress={() => onMenuPress(track)}
          hitSlop={12}
          style={styles.menuButton}
        >
          <MoreVertical size={18} color={COLORS.textMuted} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  active: {
    backgroundColor: 'rgba(176, 38, 255, 0.08)',
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
  },
  indexContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  duration: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  menuButton: {
    padding: SPACING.xs,
  },
});
