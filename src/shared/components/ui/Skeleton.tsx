/**
 * @file Skeleton.tsx
 * @description Component loading skeleton — hiệu ứng placeholder khi đang tải dữ liệu.
 * @module shared/components/ui
 */

import { View } from 'react-native';

/**
 * Props của Skeleton.
 */
interface SkeletonProps {
  /** Chiều rộng (Tailwind class, ví dụ: "w-32") */
  width?: string;
  /** Chiều cao (Tailwind class, ví dụ: "h-4") */
  height?: string;
  /** Bo tròn: true cho hình tròn, false cho bo góc mặc định */
  rounded?: boolean;
  /** Class Tailwind bổ sung */
  className?: string;
}

/**
 * Skeleton — placeholder loading animation.
 * Dùng thay thế cho nội dung thật khi đang fetch dữ liệu.
 *
 * @example
 * // Skeleton dạng dòng text
 * <Skeleton width="w-48" height="h-4" />
 * // Skeleton dạng avatar tròn
 * <Skeleton width="w-12" height="h-12" rounded />
 * // Skeleton dạng card
 * <Skeleton width="w-full" height="h-40" />
 */
export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = false,
  className = '',
}: SkeletonProps) {
  return (
    <View
      className={`animate-pulse bg-[#2A2A3E] ${width} ${height} ${rounded ? 'rounded-full' : 'rounded-lg'} ${className}`}
    />
  );
}
