/**
 * @file AppLogo.tsx
 * @description Component logo ứng dụng dùng chung toàn app.
 * Sử dụng hình ảnh logo thực từ assets.
 * @module shared/components/ui
 */

import { Image, StyleSheet, View, ViewStyle } from 'react-native'

/** Đường dẫn logo — import tĩnh để Metro bundler đóng gói */
const LOGO_SOURCE = require('../../../../assets/images/logo.png')

interface AppLogoProps {
  /** Kích thước logo (width & height) */
  size?: number
  /** Style bổ sung cho container */
  style?: ViewStyle
}

/**
 * Component hiển thị logo ứng dụng.
 *
 * @example
 * <AppLogo size={80} />
 * <AppLogo size={120} style={{ marginBottom: 20 }} />
 */
export function AppLogo({ size = 80, style }: AppLogoProps) {
  return (
    <View style={[styles.container, style]}>
      <Image 
        source={LOGO_SOURCE} 
        style={[
          { width: size, height: size },
          style?.borderRadius !== undefined && { borderRadius: style.borderRadius }
        ]} 
        resizeMode='contain' 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})
