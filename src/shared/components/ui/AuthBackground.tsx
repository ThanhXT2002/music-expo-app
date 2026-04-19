/**
 * @file AuthBackground.tsx
 * @description Background dùng chung cho tất cả auth screens.
 * Grid pattern + Neon Blobs (SVG radial gradient mô phỏng CSS blur(60px)).
 * Giống style web: #ff00ff, #00ffff, #8b5cf6 với opacity mờ dần từ trong ra ngoài.
 * @module shared/components/ui
 */

import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

// ─── Grid Pattern ─────────────────────────────────────────────────────────────

/** Grid nền với các đường kẻ mỏng mờ giống bg-grid trên web */
function GridLines() {
  const S = 20;
  const cols = Math.ceil(W / S);
  const rows = Math.ceil(H / S);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <View
          key={`h${i}`}
          style={{
            position: 'absolute',
            top: i * S,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.10)',
          }}
        />
      ))}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <View
          key={`v${i}`}
          style={{
            position: 'absolute',
            left: i * S,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'rgba(255,255,255,0.10)',
          }}
        />
      ))}
    </View>
  );
}

// ─── Neon Blob (SVG RadialGradient — mô phỏng CSS blur(60px)) ────────────────

interface BlobProps {
  /** Tâm X (tỉ lệ 0-1 so với màn hình) */
  cx: number;
  /** Tâm Y (tỉ lệ 0-1 so với màn hình) */
  cy: number;
  /** Bán kính blob (px) */
  radius: number;
  /** Màu neon (#ff00ff, #00ffff, #8b5cf6) */
  color: string;
  /** Opacity tại tâm (mặc định 0.4 — giống web) */
  opacity?: number;
}

/**
 * Blob phát sáng sử dụng SVG RadialGradient.
 * Tái tạo hiệu ứng `filter: blur(60px)` của web:
 * - Tâm: màu đậm (opacity cao)
 * - Viền: hoàn toàn trong suốt (opacity 0)
 * → Effect mờ dần từ trong ra ngoài tự nhiên.
 */
function NeonBlob({ cx, cy, radius, color, opacity = 0.4 }: BlobProps) {
  const x = cx * W - radius;
  const y = cy * H - radius;
  const size = radius * 2;

  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
      }}
      pointerEvents="none"
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`blob-${cx}-${cy}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="40%" stopColor={color} stopOpacity={opacity * 0.7} />
            <Stop offset="70%" stopColor={color} stopOpacity={opacity * 0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={size}
          height={size}
          fill={`url(#blob-${cx}-${cy})`}
        />
      </Svg>
    </View>
  );
}

// ─── Auth Background Component ────────────────────────────────────────────────

interface AuthBackgroundProps {
  /** Variant chọn vị trí blob khác nhau cho mỗi screen */
  variant?: 'login' | 'register' | 'forgot' | 'verify';
}

/**
 * Component background dùng chung toàn bộ auth screens.
 * Bao gồm: Background tối + Grid pattern + 3 Neon Blobs + 2 Glow effects.
 *
 * @example
 * <AuthBackground variant="login" />
 */
export function AuthBackground({ variant = 'login' }: AuthBackgroundProps) {
  const blobs = BLOB_CONFIGS[variant];

  return (
    <>
      {/* Nền đen chính */}
      <View style={styles.bg} />
      {/* Grid pattern */}
      <GridLines />
      {/* Neon blobs — giống web */}
      {blobs.map((b, i) => (
        <NeonBlob key={i} {...b} />
      ))}
    </>
  );
}

// ─── Blob Configurations — mỗi screen có bố cục blob khác nhau ───────────────

const BLOB_CONFIGS: Record<string, BlobProps[]> = {
  login: [
    // Magenta — top-left (giống web: .blob bg-[#ff00ff])
    { cx: 0.0, cy: 0.0, radius: 220, color: '#ff00ff', opacity: 0.35 },
    // Cyan — bottom-right (giống web: .blob bg-[#00ffff])
    { cx: 1.0, cy: 1.0, radius: 220, color: '#00ffff', opacity: 0.3 },
    // Purple — center-left (giống web: .blob bg-[#8b5cf6])
    { cx: 0.25, cy: 0.65, radius: 200, color: '#8b5cf6', opacity: 0.3 },
  ],
  register: [
    // Cyan — top-right
    { cx: 1.0, cy: 0.0, radius: 200, color: '#00ffff', opacity: 0.3 },
    // Magenta — left-center
    { cx: 0.0, cy: 0.55, radius: 200, color: '#ff00ff', opacity: 0.3 },
    // Purple — bottom-center
    { cx: 0.6, cy: 1.0, radius: 180, color: '#8b5cf6', opacity: 0.28 },
  ],
  forgot: [
    // Magenta — top-left
    { cx: 0.1, cy: 0.0, radius: 200, color: '#ff00ff', opacity: 0.3 },
    // Cyan — bottom-right
    { cx: 1.0, cy: 0.85, radius: 180, color: '#00ffff', opacity: 0.28 },
    // Purple — center-right
    { cx: 0.9, cy: 0.4, radius: 170, color: '#8b5cf6', opacity: 0.25 },
  ],
  verify: [
    // Purple — center
    { cx: 0.4, cy: 0.3, radius: 220, color: '#8b5cf6', opacity: 0.25 },
    // Cyan — bottom-right
    { cx: 1.0, cy: 0.9, radius: 170, color: '#00ffff', opacity: 0.25 },
    // Magenta — top-right
    { cx: 0.9, cy: 0.0, radius: 160, color: '#ff00ff', opacity: 0.28 },
  ],
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080316',
  },
});
