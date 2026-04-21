/**
 * @file SearchBar.tsx
 * @description Thanh tìm kiếm — input có icon và nút xoá.
 * @module features/search
 */

import { View, Pressable, TextInput } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

interface SearchBarProps {
  /** Giá trị hiện tại */
  value: string
  /** Hàm cập nhật giá trị */
  onChangeText: (text: string) => void
}

/**
 * SearchBar — thanh tìm kiếm với icon và nút xoá.
 */
export function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View className='mx-4 mt-2 flex-row items-center gap-2 rounded-xl bg-[#1E1E2E] px-4 py-3'>
      <Ionicons name='search' size={20} color='#6B6B6B' />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder='Bài hát, nghệ sĩ, album...'
        placeholderTextColor='#6B6B6B'
        className='flex-1 text-sm text-[#EAEAEA]'
        autoCapitalize='none'
        autoCorrect={false}
        returnKeyType='search'
      />

      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')}>
          <Ionicons name='close-circle' size={20} color='#6B6B6B' />
        </Pressable>
      )}
    </View>
  )
}
