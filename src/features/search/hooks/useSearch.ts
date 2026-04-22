/**
 * @file useSearch.ts
 * @description Hook quản lý tìm kiếm và gợi ý với debounce.
 * @module features/search/hooks
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@shared/hooks/useDebounce'
import { createLogger } from '@core/logger'
import { searchAll, fetchSuggestions } from '../services/searchService'

const logger = createLogger('use-search')

/**
 * Hook quản lý tìm kiếm chính (Full Search).
 *
 * @param query - Từ khoá tìm kiếm chưa debounce
 * @returns Kết quả tìm kiếm, trạng thái và lỗi
 */
export function useSearchFull(query: string) {
  const debouncedQuery = useDebounce(query, 400) // Theo plan là 400ms

  const searchQuery = useQuery({
    queryKey: ['search-full', debouncedQuery],
    queryFn: () => {
      logger.info('Thực hiện tìm kiếm full', { query: debouncedQuery })
      return searchAll(debouncedQuery)
    },
    // Chỉ tìm khi có ít nhất 2 ký tự
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000 // Cache 5 phút
  })

  return {
    /** Kết quả tìm kiếm */
    results: searchQuery.data ?? null,
    /** Đang tải (gọi API thực sự) */
    isSearching: searchQuery.isPending && debouncedQuery.length >= 2,
    /** Đang đợi debounce xong mới gọi */
    isWaitingDebounce: query !== debouncedQuery,
    /** Lỗi tìm kiếm */
    error: searchQuery.error,
    /** true nếu có kết quả */
    hasResults: !!searchQuery.data
  }
}

/**
 * Hook quản lý gợi ý tìm kiếm (Auto-Suggest).
 *
 * @param query - Từ khóa hiện tại đang gõ
 * @returns Mảng string gợi ý
 */
export function useSearchSuggestions(query: string) {
  const debouncedQuery = useDebounce(query, 200) // Theo plan là 200ms

  const suggestionsQuery = useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => {
      logger.info('Tải gợi ý', { query: debouncedQuery })
      return fetchSuggestions(debouncedQuery)
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 1 * 60 * 1000 // Cache 1 phút
  })

  return {
    suggestions: suggestionsQuery.data ?? [],
    isFetchingSuggestions: suggestionsQuery.isFetching,
  }
}
