/**
 * @file SectionHeader.tsx
 * @description Header tiêu đề section — dùng chung ở Home, Library, Search, v.v.
 * Hiển thị tiêu đề bên trái và nút "Xem tất cả" bên phải.
 * @module shared/components
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS } from '@shared/constants/colors';
import { FONT_SIZE, SPACING } from '@shared/constants/spacing';

interface SectionHeaderProps {
  /** Tiêu đề section */
  title: string;
  /** Callback khi nhấn "Xem tất cả" */
  onSeeAll?: () => void;
  /** Text tuỳ chỉnh cho action button */
  actionText?: string;
}

/**
 * SectionHeader — tiêu đề + "Xem tất cả" cho các section trên pages.
 */
export function SectionHeader({ title, onSeeAll, actionText = 'Xem tất cả' }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={styles.action} hitSlop={8}>
          <Text style={styles.actionText}>{actionText}</Text>
          <ChevronRight size={16} color={COLORS.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
