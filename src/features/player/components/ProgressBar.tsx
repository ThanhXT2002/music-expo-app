/**
 * @file ProgressBar.tsx
 * @description Thanh tiến trình phát nhạc — gradient fill, draggable thumb, buffer bar.
 *
 * Fix: Dùng useRef cho PanResponder để tránh stale closure (React Native gotcha).
 *
 * @module features/player
 */

import { useRef, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, PanResponder, LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@shared/constants/colors';
import { FONT_SIZE, SPACING } from '@shared/constants/spacing';
import { formatDuration } from '@shared/utils/formatDuration';

interface ProgressBarProps {
  /** Tiến trình 0–1 */
  progress: number;
  /** Vị trí hiện tại (giây) */
  currentTime: number;
  /** Tổng thời lượng (giây) */
  duration: number;
  /** Buffer progress 0–1 (mặc định 1) */
  buffer?: number;
  /** Callback khi seek */
  onSeek: (position: number) => Promise<void>;
}

/**
 * ProgressBar — thanh tiến trình phát nhạc với gradient fill và drag gesture.
 */
export function ProgressBar({
  progress, currentTime, duration, buffer = 1, onSeek,
}: ProgressBarProps) {
  const trackWidthRef = useRef(0);
  const initialDragRatioRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  // Refs để PanResponder luôn thấy giá trị mới nhất (tránh stale closure)
  const durationRef = useRef(duration);
  durationRef.current = duration;
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  // Tính progress hiện tại dựa vào drag state
  const displayProgress = isDragging ? dragProgress : progress;
  const percentage = Math.max(0, Math.min(displayProgress * 100, 100));
  const bufferPercent = Math.max(0, Math.min(buffer * 100, 100));

  // Thời gian hiển thị — nếu đang drag, tính từ drag position
  const displayTime = isDragging ? dragProgress * duration : currentTime;

  /** Tính ratio từ locationX */
  const getRatioFromX = useCallback((locationX: number) => {
    const width = trackWidthRef.current;
    if (width <= 0) return progressRef.current;
    return Math.max(0, Math.min(locationX / width, 1));
  }, []);

  // ─── PanResponder (dùng useMemo + refs) ────────────────────────────────

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,

        onPanResponderGrant: (evt) => {
          const ratio = getRatioFromX(evt.nativeEvent.locationX);
          initialDragRatioRef.current = ratio;
          setIsDragging(true);
          setDragProgress(ratio);
        },

        onPanResponderMove: (evt, gestureState) => {
          const width = trackWidthRef.current;
          if (width <= 0) return;
          // Calculate new ratio using initial ratio + delta X from gesture
          const ratio = initialDragRatioRef.current + gestureState.dx / width;
          setDragProgress(Math.max(0, Math.min(ratio, 1)));
        },

        onPanResponderRelease: (evt, gestureState) => {
          const width = trackWidthRef.current;
          let ratio;
          if (width > 0) {
            ratio = initialDragRatioRef.current + gestureState.dx / width;
            ratio = Math.max(0, Math.min(ratio, 1));
          } else {
            ratio = getRatioFromX(evt.nativeEvent.locationX);
          }
          
          const seekTime = ratio * durationRef.current;
          onSeekRef.current(seekTime);
          
          // Add a slight delay before releasing drag state so audio manager can catch up
          // preventing the thumb from momentarily snapping back
          setTimeout(() => {
            setIsDragging(false);
          }, 200);
        },

        onPanResponderTerminate: () => {
          setIsDragging(false);
        },
      }),
    [getRatioFromX],
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidthRef.current = e.nativeEvent.layout.width;
  }, []);

  return (
    <View style={styles.container}>
      {/* Track */}
      <View
        style={[styles.trackWrapper, isDragging && styles.trackWrapperActive]}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        <View style={[styles.track, isDragging && styles.trackActive]} pointerEvents="none">
          {/* Buffer bar */}
          <View style={[styles.buffer, { width: `${bufferPercent}%` }]} />

          {/* Fill gradient */}
          <LinearGradient
            colors={['#B026FF', '#6C5CE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${percentage}%` }]}
          />

          {/* Thumb */}
          <View
            style={[
              styles.thumb,
              { left: `${percentage}%` },
              isDragging && styles.thumbActive,
            ]}
          />
        </View>
      </View>

      {/* Time labels */}
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatDuration(displayTime)}</Text>
        <Text style={styles.timeText}>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
  },
  trackWrapper: {
    paddingVertical: SPACING.md,
  },
  trackWrapperActive: {
    paddingVertical: SPACING.sm,
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    position: 'relative',
    overflow: 'visible',
  },
  trackActive: {
    height: 6,
  },
  buffer: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginLeft: -8,
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  thumbActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    top: -8,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(176, 38, 255, 0.5)',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  timeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
