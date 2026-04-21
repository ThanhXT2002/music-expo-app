/**
 * @file _layout.tsx
 * @description Tab layout + PillTabBar với hiệu ứng Liquid Glass.
 * @module app/(tabs)
 */

import React, { useRef, useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
import { View, Pressable, StyleSheet, Platform, Dimensions, Animated, Text } from 'react-native'

import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { Home, Search, LibraryBig, DownloadCloud, Settings } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { RADIUS } from '@shared/constants/spacing'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const TAB_CONFIG: Record<string, { Icon: any; label: string }> = {
  index: { Icon: Home, label: 'TRANG CHỦ' },
  list: { Icon: Search, label: 'TÌM KIẾM' },
  library: { Icon: LibraryBig, label: 'THƯ VIỆN' },
  downloads: { Icon: DownloadCloud, label: 'TẢI XUỐNG' },
  settings: { Icon: Settings, label: 'CÀI ĐẶT' }
}

function PillTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets()

  // Calculate dynamic width of one tab
  // outer padding: 16*2 = 32, pill padding: 4*2 = 8. Total spacing = 40.
  const paddingSides = 32
  const pillPadding = 8
  const tabWidth = (SCREEN_WIDTH - paddingSides - pillPadding) / state.routes.length

  const animatedIndex = useRef(new Animated.Value(state.index)).current

  // Slide animation when selected index changes
  useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: state.index,
      useNativeDriver: true,
      damping: 24,
      stiffness: 200,
      mass: 0.8
    }).start()
  }, [state.index])

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24 }]}>
      <View style={styles.pill}>
        {/* Glass background */}
        <BlurView
          intensity={30}
          tint='dark'
          experimentalBlurMethod='dimezisBlurView'
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[StyleSheet.absoluteFillObject, styles.pillOverlay]} />

        {/* Sliding Active Indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              width: tabWidth,
              transform: [
                {
                  translateX: animatedIndex.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, tabWidth]
                  })
                }
              ]
            }
          ]}
        />

        {/* Tabs */}
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index
          const config = TAB_CONFIG[route.name] || { Icon: Home, label: route.name }
          const TabIcon = config.Icon
          const textColor = isFocused ? COLORS.primary : COLORS.textMuted

          const onPress = () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityRole='button'
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={config.label}
            >
              <TabIcon size={20} color={textColor} strokeWidth={isFocused ? 2.5 : 1.8} />
              <Text
                style={[styles.tabLabel, { color: textColor, fontWeight: isFocused ? '700' : '500' }]}
                numberOfLines={1}
              >
                {config.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} />}
      screenOptions={{
        headerShown: false
      }}
    >
      <Tabs.Screen name='index' options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name='list' options={{ title: 'Danh sách' }} />
      <Tabs.Screen name='library' options={{ title: 'Thư viện' }} />
      <Tabs.Screen name='downloads' options={{ title: 'Tải xuống' }} />
      <Tabs.Screen name='settings' options={{ title: 'Cài đặt' }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBarOuter: {
    paddingTop: 12,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0
  },
  pill: {
    flexDirection: 'row',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    height: 64,
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    // Glow shadow
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
  activeIndicator: {
    position: 'absolute',
    left: 4, // Matches pill paddingHorizontal
    top: 4,
    bottom: 4,
    borderRadius: 26,
    backgroundColor: 'rgba(176, 38, 255, 0.12)'
  },
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
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 1
  }
})
