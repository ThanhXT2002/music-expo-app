/**
 * @file logger.ts
 * @description Logger tập trung cho toàn dự án. Tự động tắt log ở production.
 * Prefix theo module giúp lọc nhanh trên Expo DevTools / Logcat / Console.
 * @module core
 */

const IS_DEV = __DEV__

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

/**
 * Tạo prefix cho log message — bao gồm icon theo level và tên module viết hoa.
 *
 * @param module - Tên module (ví dụ: 'player', 'auth')
 * @param level - Mức độ log
 * @returns Chuỗi prefix dạng "[ℹ PLAYER]"
 */
function buildPrefix(module: string, level: LogLevel): string {
  const icons: Record<LogLevel, string> = {
    info: 'ℹ',
    warn: '⚠',
    error: '✖',
    debug: '◉'
  }
  return `[${icons[level]} ${module.toUpperCase()}]`
}

/**
 * Tạo logger instance cho một module cụ thể.
 * Mỗi file nên tạo một logger riêng với tên module tương ứng.
 *
 * @param module - Tên module để hiển thị trong prefix log
 * @returns Object chứa các hàm log theo level: info, warn, error, debug
 *
 * @example
 * const logger = createLogger('player');
 * logger.info('Bắt đầu phát bài hát', { trackId, title });
 * logger.error('Lỗi kết nối stream', error);
 */
export function createLogger(module: string) {
  return {
    /**
     * Log thông tin thông thường — luồng chạy bình thường.
     */
    info: (message: string, data?: unknown) => {
      if (!IS_DEV) return
      console.log(buildPrefix(module, 'info'), message, data ?? '')
    },

    /**
     * Log cảnh báo — có thể gây vấn đề nhưng chưa crash.
     */
    warn: (message: string, data?: unknown) => {
      if (!IS_DEV) return
      console.warn(buildPrefix(module, 'warn'), message, data ?? '')
    },

    /**
     * Log lỗi — luôn hiển thị kể cả production.
     */
    error: (message: string, error?: unknown) => {
      console.error(buildPrefix(module, 'error'), message, error ?? '')
    },

    /**
     * Log debug chi tiết — chỉ bật khi cần điều tra.
     */
    debug: (message: string, data?: unknown) => {
      if (!IS_DEV) return
      console.debug(buildPrefix(module, 'debug'), message, data ?? '')
    }
  }
}
