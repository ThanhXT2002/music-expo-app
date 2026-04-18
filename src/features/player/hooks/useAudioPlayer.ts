/**
 * @file useAudioPlayer.ts
 * @description Hook quản lý Audio Player với Zustand + TrackPlayer
 */
import { useEffect } from 'react';
import TrackPlayer, { State, usePlaybackState, useProgress, useActiveTrack } from 'react-native-track-player';
import { setupPlayer } from '../services/playerSetup';

export const useAudioPlayer = () => {
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const activeTrack = useActiveTrack();

  useEffect(() => {
    // Khởi tạo Player khi hook được mount lần đầu
    setupPlayer();
  }, []);

  const play = async (track?: any) => {
    try {
      if (track) {
        await TrackPlayer.reset();
        await TrackPlayer.add([track]);
        await TrackPlayer.play();
      } else {
        await TrackPlayer.play();
      }
    } catch (e) {
      console.log('Playback error:', e);
    }
  };

  const pause = async () => {
    await TrackPlayer.pause();
  };

  const seekTo = async (amount: number) => {
    await TrackPlayer.seekTo(amount);
  };

  const skipToNext = async () => {
    await TrackPlayer.skipToNext();
  };

  const skipToPrevious = async () => {
    await TrackPlayer.skipToPrevious();
  };

  return {
    // Chuyển state sang kiểu dễ đọc hơn
    isPlaying: playbackState.state === State.Playing,
    isBuffering: playbackState.state === State.Buffering || playbackState.state === State.Loading,
    progress,
    activeTrack,
    controls: {
      play,
      pause,
      seekTo,
      skipToNext,
      skipToPrevious,
    },
  };
};
