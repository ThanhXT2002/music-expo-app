/**
 * @file useDownloads.ts
 * @description Hook tổng hợp cho màn hình Downloads.
 * Kết nối Zustand store + khởi tạo data + expose actions cho UI.
 * @module features/downloads/hooks
 */

import { useEffect, useCallback, useState } from 'react';
import { useDownloadStore } from '../store/downloadStore';
import { isYoutubeUrl } from '../services/downloadService';

/**
 * Hook dùng cho màn hình Downloads.
 * Tự động load offline songs khi mount.
 */
export function useDownloads() {
  const store = useDownloadStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Load offline songs khi mount
  useEffect(() => {
    store.loadOfflineSongs();
  }, []);

  /** Xử lý khi user nhấn nút tìm kiếm / submit */
  const handleSubmit = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) return;

    if (isYoutubeUrl(query)) {
      await store.submitYouTubeUrl(query);
      setSearchQuery(''); // Clear input sau khi submit
    } else if (query.length >= 2) {
      await store.searchByKeyword(query);
    }
  }, [searchQuery, store]);

  /** Xoá nội dung tìm kiếm */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    store.clearSearch();
  }, [store]);

  /** Kiểm tra query hiện tại có phải YouTube URL không */
  const isUrlMode = isYoutubeUrl(searchQuery);

  // Tách tasks theo trạng thái
  const activeTasks = store.tasks.filter(
    (t) => t.status === 'downloading' || t.status === 'idle' || t.serverStatus === 'processing' || t.serverStatus === 'pending',
  );
  const errorTasks = store.tasks.filter((t) => t.status === 'error');

  return {
    // State
    searchQuery,
    setSearchQuery,
    isUrlMode,
    isSearching: store.isSearching,
    activeTasks,
    errorTasks,
    offlineSongs: store.offlineSongs,
    searchResults: store.searchResults,
    totalSize: store.totalSize,

    // Actions
    handleSubmit,
    clearSearch,
    removeTrack: store.removeTrack,
    isDownloaded: store.isDownloaded,
  };
}
