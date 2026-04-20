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
import React from 'react';

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
  /** Callback khi nhấn menu "..." */
  onMenuPress?: (track: Track) => void;
  /** Track này đang active (đang phát) */
  isActive?: boolean;
  /** Icon hiển thị bên phải, mặc định là 3 chấm */
  rightIcon?: React.ReactNode;
  /** Hiển thị thời lượng (mặc định true) */
  showDuration?: boolean;
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
  rightIcon,
  showDuration = true,
}: TrackListItemProps) {
  return (
    <Pressable onPress={() => onPress(track)}>
      {({ pressed }) => (
        <View style={[
          styles.container,
          pressed && styles.pressed,
          isActive && styles.active,
        ]}>
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
          <View style={styles.rightContent}>
            {showDuration && (
              <Text style={styles.duration}>{formatDuration(track.durationSeconds)}</Text>
            )}

            {/* Menu button */}
            {onMenuPress && (
              <Pressable
                onPress={(e) => { e.stopPropagation(); onMenuPress(track); }}
                hitSlop={12}
                style={styles.menuButton}
              >
                {rightIcon || <MoreVertical size={18} color={COLORS.textMuted} />}
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(20, 15, 45, 0.7)',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
  },
  pressed: {
    backgroundColor: 'rgba(176, 38, 255, 0.12)',
    transform: [{ scale: 0.98 }],
  },
  active: {
    backgroundColor: 'rgba(176, 38, 255, 0.2)',
    borderColor: 'rgba(176, 38, 255, 0.5)',
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full, // Tròn giống pill
  },
  indexContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.full,
  },
  indexText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: '#A0A0A0',
    marginTop: 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  duration: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  menuButton: {
    padding: SPACING.xs,
  },
});
