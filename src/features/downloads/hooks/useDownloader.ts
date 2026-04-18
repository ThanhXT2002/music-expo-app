/**
 * @file useDownloader.ts
 * @description Luồng xử lý download file Mp3 vật lý và lưu DB
 */
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { saveOfflineSong, deleteOfflineSong, LocalSong } from '../../../core/data/database';
import { apiClient } from '../../../core/api/apiClient';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

export const useDownloader = () => {
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);

  const downloadSong = async (song: LocalSong) => {
    try {
      setDownloadingIds((prev) => [...prev, song.id]);
      
      // 1. Backend Download URL
      const streamUrl = `${process.env.EXPO_PUBLIC_API_URL}${API_ENDPOINTS.SONG_PROXY_DOWNLOAD(song.id)}`;

      // 2. Local File Destination
      const docDir = (FileSystem as any).documentDirectory || '';
      const fileUri = `${docDir}${song.id}.mp3`;

      // 3. Tải file bằng expo-file-system
      const downloadResumable = FileSystem.createDownloadResumable(
        streamUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Downloading ${song.id}: ${(progress * 100).toFixed(2)}%`);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.status === 200) {
        // 4. Lưu thông tin bản ghi vào SQLite
        await saveOfflineSong({
          ...song,
          localAudioUri: result.uri // URL của file MP3 local
        });
        console.log('✅ File Downloaded and Saved:', result.uri);
      } else {
        console.error('Failed to download audio file');
      }

    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloadingIds((prev) => prev.filter((id) => id !== song.id));
    }
  };

  const removeOfflineSong = async (songId: string) => {
    try {
      // 1. Xóa file vật lý
      const docDir = (FileSystem as any).documentDirectory || '';
      await FileSystem.deleteAsync(`${docDir}${songId}.mp3`, {
        idempotent: true
      });
      // 2. Xóa record trong DB
      await deleteOfflineSong(songId);
      console.log('🗑️ Xoá bài hát thành công');
    } catch (e) {
      console.error('Error removing offline song', e);
    }
  };

  return {
    downloadSong,
    removeOfflineSong,
    downloadingIds,
  };
};
