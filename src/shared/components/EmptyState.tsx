/**
 * @file EmptyState.tsx
 * @description Component hiển thị khi danh sách trống — không có kết quả, chưa có dữ liệu.
 * @module shared/components
 */

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { COLORS } from '../constants/colors';
import { FONT_SIZE, SPACING } from '../constants/spacing';

/**
 * Props của EmptyState.
 */
interface EmptyStateProps {
  /** Tên icon Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Tiêu đề */
  title: string;
  /** Mô tả chi tiết */
  description?: string;
  /** Text nút hành động */
  actionLabel?: string;
  /** Hàm xử lý khi nhấn nút hành động */
  onAction?: () => void;
}

/**
 * EmptyState — hiển thị khi không có dữ liệu.
 */
export function EmptyState({
  icon = 'albums-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={COLORS.textMuted} />

      <Text style={styles.title}>{title}</Text>

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {actionLabel && onAction && (
        <View style={styles.buttonWrapper}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING['3xl'],
  },
  title: {
    marginTop: SPACING.lg,
    textAlign: 'center',
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  description: {
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  buttonWrapper: {
    marginTop: SPACING.xl,
  },
});
