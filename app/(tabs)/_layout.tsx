/**
 * @file _layout.tsx
 * @description Tab layout: Mini Player circle + PillTabBar 4 tab.
 *
 * Layout:
 *   Có track:    (🎵)  [ 🏠 | 📚 | ⬇️ | ⚙️ ]
 *   Không track:       [ 🏠 | 📚 | ⬇️ | ⚙️ ]
 *
 * Mini Player circle thay thế vị trí Search circle cũ.
 * Khi không có bài hát → pill bar chiếm full width.
 * Search sẽ được triển khai ở header Home page sau.
 *
 * @module app/(tabs)
 */

import React, { useRef, useEffect } from 'react'
import { Tabs } from 'expo-router'
import { View, Pressable, StyleSheet, Platform, Dimensions, Animated, Text } from 'react-native'

import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Home, LibraryBig, DownloadCloud, Settings } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { usePlayerStore } from '@features/player/store/playerStore'
import { useTabBarStore } from '@shared/store/tabBarStore'
import { TabBarMiniPlayer } from '@features/player/components/TabBarMiniPlayer'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ─── Config ──────────────────────────────────────────────────────────────────

/** Tab nằm trong pill bar */
const PILL_TABS = ['index', 'library', 'downloads', 'settings'] as const

const TAB_CONFIG: Record<string, { Icon: any; label: string }> = {
  index: { Icon: Home, label: 'TRANG CHỦ' },
  library: { Icon: LibraryBig, label: 'THƯ VIỆN' },
  downloads: { Icon: DownloadCloud, label: 'TẢI XUỐNG' },
  settings: { Icon: Settings, label: 'CÀI ĐẶT' }
}

// ─── Dimensions ──────────────────────────────────────────────────────────────

const CIRCLE_SIZE = 64
const CIRCLE_GAP = 10
const PILL_H_PAD = 4
const OUTER_H_PAD = 16
const PILL_HEIGHT = 64

/**
 * Tính TAB_WIDTH tùy thuộc có Mini Player circle hay không.
 * Khi có track → pill nhỏ hơn (trừ circle + gap).
 * Khi không có track → pill full width.
 */
function calcTabWidth(hasTrack: boolean) {
  const circleSpace = hasTrack ? CIRCLE_SIZE + CIRCLE_GAP : 0
  const pillInner = SCREEN_WIDTH - OUTER_H_PAD * 2 - circleSpace - PILL_H_PAD * 2
  return pillInner / PILL_TABS.length
}

// ─── PillTabBar ──────────────────────────────────────────────────────────────

function PillTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets()

  const currentName = state.routes[state.index]?.name
  const pillIndex = PILL_TABS.indexOf(currentName as any)

  // Mini Player position — dùng lại setting searchPosition (left/right)
  const miniPlayerPosition = useTabBarStore((s) => s.searchPosition)
  const isMiniPlayerRight = miniPlayerPosition === 'right'

  // Kiểm tra có bài hát → quyết định hiển thị circle
  const hasTrack = usePlayerStore((s) => s.currentTrack !== null)
  const TAB_WIDTH = calcTabWidth(hasTrack)

  const animValue = useRef(new Animated.Value(pillIndex >= 0 ? pillIndex : 0)).current
  const indicatorOp = useRef(new Animated.Value(pillIndex >= 0 ? 1 : 0)).current

  useEffect(() => {
    if (pillIndex >= 0) {
      Animated.parallel([
        Animated.spring(animValue, {
          toValue: pillIndex,
          useNativeDriver: true,
          damping: 24,
          stiffness: 200,
          mass: 0.8
        }),
        Animated.timing(indicatorOp, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start()
    } else {
      Animated.timing(indicatorOp, { toValue: 0, duration: 150, useNativeDriver: true }).start()
    }
  }, [state.index])

  const goTo = (name: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const route = state.routes.find((r: any) => r.name === name)
    if (!route) return
    const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
    if (currentName !== name && !ev.defaultPrevented) navigation.navigate(name, route.params)
  }

  /**
    * Layout:
    * - Flex row: [Spacer(trái)] + [Pill] hoặc [Pill] + [Spacer(phải)]
    * - Mini Player nằm absolute đè lên, khi expand phủ kín pill bar
    * - Không có track: chỉ Pill (full width)
    */

   return (
     <GestureHandlerRootView
       style={[
         styles.outer,
         { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24 }
       ]}
     >
       {/* Spacer giữ chỗ circle ở bên trái (mặc định) */}
       {!isMiniPlayerRight && hasTrack && <View style={styles.circleSpacer} />}

       {/* ── Pill Bar ── */}
       <View style={styles.pill}>
         <BlurView
           intensity={30}
           tint='dark'
           experimentalBlurMethod='dimezisBlurView'
           style={StyleSheet.absoluteFillObject}
         />
         <View style={[StyleSheet.absoluteFillObject, styles.pillOverlay]} />

         {/* Sliding indicator */}
         <Animated.View
           style={[
             styles.indicator,
             {
               width: TAB_WIDTH,
               opacity: indicatorOp,
               transform: [{
                 translateX: animValue.interpolate({
                   inputRange: PILL_TABS.map((_, i) => i),
                   outputRange: PILL_TABS.map((_, i) => TAB_WIDTH * i)
                 })
               }]
             }
           ]}
         />

         {/* Tab items */}
         {PILL_TABS.map((tabName) => {
           const route = state.routes.find((r: any) => r.name === tabName)
           if (!route) return null

           const isFocused = currentName === tabName
           const cfg = TAB_CONFIG[tabName]
           const color = isFocused ? COLORS.primary : COLORS.textMuted

           return (
             <Pressable
               key={route.key}
               onPress={() => goTo(tabName)}
               style={styles.tabItem}
               accessibilityRole='button'
               accessibilityState={isFocused ? { selected: true } : {}}
               accessibilityLabel={cfg.label}
             >
               <cfg.Icon size={20} color={color} strokeWidth={isFocused ? 2.5 : 1.8} />
               <Text style={[styles.tabLabel, { color, fontWeight: isFocused ? '700' : '500' }]} numberOfLines={1}>
                 {cfg.label}
               </Text>
             </Pressable>
           )
         })}
       </View>

       {/* Spacer giữ chỗ circle ở bên phải */}
       {isMiniPlayerRight && hasTrack && <View style={styles.circleSpacer} />}

       {/* Mini Player — absolute, đè lên pill khi expand */}
       {hasTrack && (
         <TabBarMiniPlayer isSearchRight={isMiniPlayerRight} />
       )}
     </GestureHandlerRootView>
   )
}

// ─── Tab Layout ──────────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <PillTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name='index' options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name='library' options={{ title: 'Thư viện' }} />
      <Tabs.Screen name='downloads' options={{ title: 'Tải xuống' }} />
      <Tabs.Screen name='settings' options={{ title: 'Cài đặt' }} />
    </Tabs>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: CIRCLE_GAP,
    paddingTop: 12,
    paddingHorizontal: OUTER_H_PAD,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },

  // Spacer giữ chỗ circle trong flex row
  circleSpacer: {
    width: CIRCLE_SIZE,
    height: PILL_HEIGHT
  },

  // ── Pill ──
  pill: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    height: PILL_HEIGHT,
    paddingHorizontal: PILL_H_PAD,
    paddingVertical: 4,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },
  pillOverlay: {
    backgroundColor: 'rgba(20, 15, 45, 0.5)',
    borderRadius: 100
  },
  indicator: {
    position: 'absolute',
    left: PILL_H_PAD,
    top: 4,
    bottom: 4,
    borderRadius: 26,
    backgroundColor: 'rgba(176, 38, 255, 0.12)'
  },

  // ── Tab Item ──
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
    borderRadius: 26,
    zIndex: 1
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.8
  }
})
