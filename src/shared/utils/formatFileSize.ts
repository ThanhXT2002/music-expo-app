/**
 * @file formatFileSize.ts
 * @description Chuyển đổi kích thước file từ bytes sang định dạng đọc được.
 * @module shared/utils
 */

/**
 * Chuyển đổi bytes sang định dạng dễ đọc (KB, MB, GB).
 *
 * @param bytes - Kích thước tính bằng bytes
 * @param decimals - Số chữ số thập phân (mặc định 1)
 * @returns Chuỗi định dạng, ví dụ: 1536000 → "1.5 MB"
 *
 * @example
 * formatFileSize(1024);      // "1.0 KB"
 * formatFileSize(1536000);   // "1.5 MB"
 * formatFileSize(0);         // "0 B"
 */
export function formatFileSize(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  if (bytes < 0 || !Number.isFinite(bytes)) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, unitIndex)

  return `${size.toFixed(decimals)} ${units[unitIndex]}`
}
