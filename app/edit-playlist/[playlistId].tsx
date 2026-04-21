import { View, Text } from 'react-native'

import { useLocalSearchParams } from 'expo-router'

export default function EditPlaylistScreen() {
  const { playlistId } = useLocalSearchParams()

  return (
    <View className='flex-1 items-center justify-center bg-[#080316]'>
      <Text className='text-white text-xl'>Chỉnh sửa Playlist: {playlistId}</Text>
    </View>
  )
}
