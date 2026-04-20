/**
 * @file DownloadButton.tsx
 * @description Nút tải bài hát về offline — hiển thị trạng thái tải.
 * @module features/downloads
 */

import { Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDownload } from '../hooks/useDownload';
import type { SongInfo } from '../types';

interface DownloadButtonProps {
  /** Metadata bài hát cần tải */
  songInfo: SongInfo;
}

/**
 * DownloadButton — nút tải offline với icon trạng thái.
 */
export function DownloadButton({ songInfo }: DownloadButtonProps) {
  const { status, download, remove } = useDownload(songInfo);

  const handlePress = () => {
    if (status === 'completed') {
      remove();
    } else if (status === 'idle' || status === 'error') {
      download();
    }
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'error': return 'alert-circle-outline';
      default: return 'download-outline';
    }
  };

  const getColor = (): string => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#A0A0A0';
    }
  };

  if (status === 'downloading') {
    return <ActivityIndicator size="small" color="#6C63FF" />;
  }

  return (
    <Pressable onPress={handlePress} style={{ padding: 8 }}>
      <Ionicons name={getIcon()} size={22} color={getColor()} />
    </Pressable>
  );
}
