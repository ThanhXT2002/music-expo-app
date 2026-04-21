/**
 * @file DownloadManager.tsx
 * @description Màn hình quản lý nhạc đã tải offline.
 * @module features/downloads
 */

import { View, Text } from 'react-native'

import { EmptyState } from '@shared/components/EmptyState'

/**
 * DownloadManager — hiển thị danh sách nhạc đã tải offline.
 */
export function DownloadManager() {
  // TODO: Tích hợp đọc danh sách file đã tải từ fileStorage
  return (
    <View className='flex-1 bg-[#0A0A0A]'>
      <View className='px-4 pb-2 pt-14'>
        <Text className='text-2xl font-bold text-[#EAEAEA]'>Nhạc offline</Text>
      </View>

      <EmptyState
        icon='cloud-download-outline'
        title='Chưa tải bài hát nào'
        description='Tải nhạc về để nghe khi không có mạng.'
      />
    </View>
  )
}
