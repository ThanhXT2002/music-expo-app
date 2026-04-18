/**
 * @file useSearch.ts
 * @description Hook quản lý tìm kiếm với debounce.
 * @module features/search/hooks
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@shared/hooks/useDebounce';
import { createLogger } from '@core/logger';
import { searchAll } from '../services/searchService';

const logger = createLogger('use-search');

/**
 * Hook quản lý tìm kiếm — debounce 500ms để giảm số lần gọi API.
 *
 * @returns Giá trị tìm kiếm, kết quả, trạng thái và hàm cập nhật
 *
 * @example
 * const { query, setQuery, results, isSearching } = useSearch();
 */
export function useSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => {
      logger.info('Thực hiện tìm kiếm', { query: debouncedQuery });
      return searchAll(debouncedQuery);
    },
    // Chỉ tìm khi có ít nhất 2 ký tự
    enabled: debouncedQuery.length >= 2,
  });

  return {
    /** Từ khoá hiện tại (chưa debounce) */
    query,
    /** Cập nhật từ khoá */
    setQuery,
    /** Kết quả tìm kiếm */
    results: searchQuery.data ?? null,
    /** Đang tìm kiếm */
    isSearching: searchQuery.isLoading && debouncedQuery.length >= 2,
    /** Lỗi tìm kiếm */
    error: searchQuery.error,
    /** true nếu có kết quả */
    hasResults: !!searchQuery.data,
  };
}
