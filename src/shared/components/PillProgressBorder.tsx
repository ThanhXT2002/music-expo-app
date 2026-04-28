/**
 * @file PillProgressBorder.tsx
 * @description SVG rounded-rect progress border — bao quanh pill bar khi Mini Player expanded.
 *
 * Vẽ đường viền progress chạy quanh hình chữ nhật bo tròn (pill shape).
 * Progress chạy từ giữa-trái theo chiều kim đồng hồ.
 *
 * @module shared/components
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Rect } from 'react-native-svg'

// ─── Props ───────────────────────────────────────────────────────────────────

interface PillProgressBorderProps {
  /** Chiều rộng pill (px) */
  width: number
  /** Chiều cao pill (px) */
  height: number
  /** Tiến trình: 0 → 1 */
  progress: number
  /** Bo góc (mặc định 100 = full pill) */
  borderRadius?: number
  /** Độ dày đường viền (mặc định 2.5) */
  strokeWidth?: number
  /** Màu progress */
  progressColor?: string
  /** Màu nền track */
  trackColor?: string
}

/**
 * Đường viền progress quanh pill bar.
 * Dùng khi Mini Player ở trạng thái expanded.
 */
export function PillProgressBorder({
  width,
  height,
  progress,
  borderRadius = 100,
  strokeWidth = 2.5,
  progressColor = '#B026FF',
  trackColor = 'rgba(255, 255, 255, 0.08)'
}: PillProgressBorderProps) {
  // Tính chu vi rounded rect (xấp xỉ)
  const rx = Math.min(borderRadius, height / 2)
  const straightH = Math.max(width - 2 * rx, 0)
  const straightV = Math.max(height - 2 * rx, 0)
  const cornerArc = Math.PI * rx / 2

  // Tổng chu vi = 4 cung góc + 2 cạnh ngang + 2 cạnh dọc
  const perimeter = 4 * cornerArc + 2 * straightH + 2 * straightV

  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const dashOffset = perimeter * (1 - clampedProgress)

  // Offset SVG để stroke không bị cắt
  const svgWidth = width + strokeWidth
  const svgHeight = height + strokeWidth

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents='none'>
      <Svg width={svgWidth} height={svgHeight} style={styles.svg}>
        {/* Track nền */}
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={width}
          height={height}
          rx={rx}
          ry={rx}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill='transparent'
        />

        {/* Progress arc */}
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={width}
          height={height}
          rx={rx}
          ry={rx}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeDasharray={`${perimeter}`}
          strokeDashoffset={dashOffset}
          strokeLinecap='round'
        />
      </Svg>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  svg: {
    position: 'absolute'
  }
})
