/**
 * @file EmptyState.tsx
 * @description Component hiển thị khi danh sách trống — không có kết quả, chưa có dữ liệu.
 * @module shared/components
 */

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';

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
 *
 * @example
 * <EmptyState
 *   icon="musical-notes-outline"
 *   title="Chưa có bài hát nào"
 *   description="Hãy tìm kiếm và thêm bài hát yêu thích vào thư viện."
 *   actionLabel="Tìm kiếm"
 *   onAction={() => navigate('search')}
 * />
 */
export function EmptyState({
  icon = 'albums-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Ionicons name={icon} size={64} color="#6B6B6B" />

      <Text className="mt-4 text-center text-lg font-semibold text-[#EAEAEA]">{title}</Text>

      {description && (
        <Text className="mt-2 text-center text-sm text-[#A0A0A0]">{description}</Text>
      )}

      {actionLabel && onAction && (
        <View className="mt-6">
          <Button title={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}
