/**
 * @file useTheme.ts
 * @description Hook quản lý theme (Dark/Light mode) cho ứng dụng.
 * Mặc định sử dụng Dark Mode — phù hợp với ứng dụng nghe nhạc.
 * @module shared/hooks
 */

import { useColorScheme } from 'react-native'
import { COLORS } from '@shared/constants/colors'

/**
 * Giá trị trả về của hook useTheme.
 */
interface UseThemeReturn {
  /** true nếu đang ở Dark Mode */
  isDark: boolean
  /** Bảng màu phù hợp với theme hiện tại */
  colors: typeof COLORS
}

/**
 * Hook cung cấp thông tin theme hiện tại và bảng màu tương ứng.
 * Hiện tại luôn trả về Dark Mode colors — sẽ mở rộng Light Mode sau.
 *
 * @returns Trạng thái theme và bảng màu
 *
 * @example
 * const { isDark, colors } = useTheme();
 * <View style={{ backgroundColor: colors.background }}>
 */
export function useTheme(): UseThemeReturn {
  const colorScheme = useColorScheme()

  // NOTE: Hiện tại chỉ hỗ trợ Dark Mode — sẽ thêm Light Mode palette sau
  return {
    isDark: colorScheme === 'dark' || true,
    colors: COLORS
  }
}
