/**
 * @file _layout.tsx
 * @description Tab layout: Search circle (trái) + PillTabBar 4 tab đồng nhất.
 *
 * Layout:
 *   (🔍)   [ 🏠 | 📚 | ⬇️ | ⚙️ ]
 *   Search    Home | Library | Downloads | Settings
 *
 * @module app/(tabs)
 */

import React, { useRef, useEffect } from 'react'
import { Tabs } from 'expo-router'
import { View, Pressable, StyleSheet, Platform, Dimensions, Animated, Text } from 'react-native'

import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { Home, Search, LibraryBig, DownloadCloud, Settings } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { useTabBarStore } from '@shared/store/tabBarStore'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ─── Config ──────────────────────────────────────────────────────────────────

/** Tab nằm trong pill bar (theo thứ tự hiển thị) */
const PILL_TABS = ['index', 'library', 'downloads', 'settings'] as const
const SEARCH_TAB = 'list'

const TAB_CONFIG: Record<string, { Icon: any; label: string }> = {
  index: { Icon: Home, label: 'TRANG CHỦ' },
  list: { Icon: Search, label: 'TÌM KIẾM' },
  library: { Icon: LibraryBig, label: 'THƯ VIỆN' },
  downloads: { Icon: DownloadCloud, label: 'TẢI XUỐNG' },
  settings: { Icon: Settings, label: 'CÀI ĐẶT' }
}

// ─── Dimensions ──────────────────────────────────────────────────────────────

const SEARCH_SIZE = 64
const SEARCH_GAP = 10
const PILL_H_PAD = 4
const OUTER_H_PAD = 16
const PILL_HEIGHT = 64

const PILL_INNER_WIDTH = SCREEN_WIDTH - OUTER_H_PAD * 2 - SEARCH_SIZE - SEARCH_GAP - PILL_H_PAD * 2
const TAB_WIDTH = PILL_INNER_WIDTH / PILL_TABS.length

// ─── PillTabBar ──────────────────────────────────────────────────────────────

function PillTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets()

  const currentName = state.routes[state.index]?.name
  const pillIndex = PILL_TABS.indexOf(currentName as any)
  const isSearchActive = currentName === SEARCH_TAB
  const searchPosition = useTabBarStore((s) => s.searchPosition)
  const isSearchRight = searchPosition === 'right'

  const animValue = useRef(new Animated.Value(pillIndex >= 0 ? pillIndex : 0)).current
  const indicatorOp = useRef(new Animated.Value(pillIndex >= 0 ? 1 : 0)).current

  useEffect(() => {
    if (pillIndex >= 0) {
      // Tab trong pill active → slide indicator
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
      // Search active → ẩn indicator
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

  return (
    <View style={[styles.outer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24, flexDirection: isSearchRight ? 'row-reverse' : 'row' }]}>
      {/* ── Search Circle (bên trái) ── */}
      <Pressable
        style={[styles.searchCircle, isSearchActive && styles.searchActive]}
        onPress={() => goTo(SEARCH_TAB)}
        accessibilityRole='button'
        accessibilityLabel='TÌM KIẾM'
      >
        <BlurView intensity={30} tint='dark' experimentalBlurMethod='dimezisBlurView' style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, styles.searchOverlay]} />
        {isSearchActive && <View style={[StyleSheet.absoluteFillObject, styles.searchHighlight]} />}
        <Search size={22} color={isSearchActive ? COLORS.primary : COLORS.textMuted} strokeWidth={isSearchActive ? 2.5 : 1.8} />
      </Pressable>

      {/* ── Pill Bar (bên phải, 4 tab đồng nhất) ── */}
      <View style={styles.pill}>
        {/* Glass background */}
        <BlurView intensity={30} tint='dark' experimentalBlurMethod='dimezisBlurView' style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, styles.pillOverlay]} />

        {/* Sliding indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: TAB_WIDTH,
              opacity: indicatorOp,
              transform: [
                {
                  translateX: animValue.interpolate({
                    inputRange: [0, 1, 2, 3],
                    outputRange: [0, TAB_WIDTH, TAB_WIDTH * 2, TAB_WIDTH * 3]
                  })
                }
              ]
            }
          ]}
        />

        {/* 4 tab items — cùng style */}
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
    </View>
  )
}

// ─── Tab Layout ──────────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <PillTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name='index' options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name='list' options={{ title: 'Danh sách' }} />
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
    gap: SEARCH_GAP,
    paddingTop: 12,
    paddingHorizontal: OUTER_H_PAD,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },

  // ── Search Circle ──
  searchCircle: {
    width: SEARCH_SIZE,
    height: SEARCH_SIZE,
    borderRadius: SEARCH_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6
  },
  searchActive: {
    borderColor: 'rgba(176, 38, 255, 0.4)'
  },
  searchOverlay: {
    backgroundColor: 'rgba(20, 15, 45, 0.6)',
    borderRadius: SEARCH_SIZE / 2
  },
  searchHighlight: {
    backgroundColor: 'rgba(176, 38, 255, 0.15)',
    borderRadius: SEARCH_SIZE / 2
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

  // ── Tab Item (đồng nhất cho cả 4) ──
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
