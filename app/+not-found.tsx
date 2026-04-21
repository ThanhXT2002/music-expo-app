/**
 * @file +not-found.tsx
 * @description Trang 404 — hiển thị khi route không tồn tại.
 * @module app
 */

import { View, Text } from 'react-native'

import { useRouter } from 'expo-router'
import { Button } from '@shared/components/ui/Button'

/**
 * Trang lỗi 404 — không tìm thấy route.
 */
export default function NotFoundScreen() {
  const router = useRouter()

  return (
    <View className='flex-1 items-center justify-center bg-[#0A0A0A] px-6'>
      <Text className='text-6xl font-bold text-[#6C63FF]'>404</Text>
      <Text className='mt-4 text-lg font-semibold text-[#EAEAEA]'>Không tìm thấy trang</Text>
      <Text className='mt-2 text-center text-sm text-[#A0A0A0]'>Trang bạn tìm kiếm không tồn tại hoặc đã bị xoá.</Text>
      <View className='mt-8'>
        <Button title='Về trang chủ' onPress={() => router.replace('/')} />
      </View>
    </View>
  )
}
