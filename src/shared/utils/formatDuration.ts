/**
 * @file formatDuration.ts
 * @description Chuyển đổi thời lượng từ giây sang các định dạng hiển thị.
 * @module shared/utils
 */

/**
 * Chuyển đổi giây sang định dạng mm:ss.
 *
 * @param seconds - Thời gian tính bằng giây (số nguyên dương)
 * @returns Chuỗi định dạng "m:ss", ví dụ: 225 → "3:45"
 *
 * @example
 * formatDuration(225);  // "3:45"
 * formatDuration(60);   // "1:00"
 * formatDuration(5);    // "0:05"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0 || !Number.isFinite(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Chuyển đổi giây sang dạng đọc được tiếng Việt.
 *
 * @param seconds - Thời gian tính bằng giây
 * @returns Chuỗi tiếng Việt, ví dụ: 225 → "3 phút 45 giây"
 */
export function formatDurationVN(seconds: number): string {
  if (seconds < 0 || !Number.isFinite(seconds)) return '0 giây';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins === 0) return `${secs} giây`;
  if (secs === 0) return `${mins} phút`;
  return `${mins} phút ${secs} giây`;
}
