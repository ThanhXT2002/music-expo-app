/**
 * @file useDebounce.ts
 * @description Hook debounce — trì hoãn cập nhật giá trị để giảm số lần gọi API.
 * Dùng phổ biến cho thanh tìm kiếm.
 * @module shared/hooks
 */

import { useEffect, useState } from 'react';

/**
 * Hook trì hoãn cập nhật giá trị theo khoảng thời gian chỉ định.
 * Giá trị chỉ được cập nhật sau khi người dùng ngừng thay đổi.
 *
 * @param value - Giá trị cần debounce
 * @param delay - Thời gian trì hoãn (ms), mặc định 300ms
 * @returns Giá trị đã debounce
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearch) fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Huỷ timer cũ mỗi khi value thay đổi trước khi hết delay
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
