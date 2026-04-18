/**
 * @file playerSetup.ts
 * @description file cài đặt react-native-track-player cho ứng dụng Music.
 */
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
} from 'react-native-track-player';

let isSetup = false;

export async function setupPlayer() {
  if (isSetup) return;

  try {
    await TrackPlayer.setupPlayer();
    
    // Cấu hình các nút điều khiển hiển thị trên LockScreen và Notification
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      // Khi ứng dụng chạy các Media controls sẽ hiển thị capabilities này:
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
    });

    isSetup = true;
  } catch (error) {
    console.error('Failed to setup TrackPlayer', error);
  }
}

/**
 * Thường đăng ký trong index.js hoặc qua config plugin/service để handle background events
 */
export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
}
