/**
 * @file SearchScreen.tsx
 * @description Màn hình tìm kiếm — thanh tìm kiếm và hiển thị kết quả.
 * @module features/search
 */

import { View, Text } from 'react-native';
import { useSearch } from '../hooks/useSearch';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { EmptyState } from '@shared/components/EmptyState';

/**
 * Màn hình tìm kiếm bài hát, album, nghệ sĩ.
 */
export default function SearchScreen() {
  const { query, setQuery, results, isSearching, hasResults } = useSearch();

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      {/* Header */}
      <View className="px-4 pb-2 pt-14">
        <Text className="text-2xl font-bold text-[#EAEAEA]">Tìm kiếm</Text>
      </View>

      {/* Thanh tìm kiếm */}
      <SearchBar value={query} onChangeText={setQuery} />

      {/* Kết quả */}
      {hasResults && results ? (
        <SearchResults results={results} />
      ) : query.length >= 2 && !isSearching ? (
        <EmptyState
          icon="search-outline"
          title="Không tìm thấy kết quả"
          description={`Không có kết quả nào cho "${query}"`}
        />
      ) : !query ? (
        <EmptyState
          icon="musical-notes-outline"
          title="Tìm kiếm nhạc"
          description="Nhập tên bài hát, nghệ sĩ hoặc album."
        />
      ) : null}
    </View>
  );
}
