import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ListMusic, LibraryBig, DownloadCloud, Settings } from 'lucide-react-native';

const TAB_CONFIG: Record<string, { Icon: any; label: string }> = {
  index: { Icon: Home, label: 'TRANG CHỦ' },
  list: { Icon: ListMusic, label: 'DANH SÁCH' },
  library: { Icon: LibraryBig, label: 'THƯ VIỆN' },
  downloads: { Icon: DownloadCloud, label: 'TẢI XUỐNG' },
  settings: { Icon: Settings, label: 'CÀI ĐẶT' },
};
import { COLORS } from '@shared/constants/colors';

function PillTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24 }]}>
      <View style={[styles.pill, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || { Icon: Home, label: route.name };
          const TabIcon = config.Icon;
          const textColor = isFocused ? COLORS.primary : COLORS.textMuted;

          const onPress = () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={config.label}
            >
              <TabIcon size={20} color={textColor} strokeWidth={isFocused ? 2.5 : 1.8} />
              <Text
                style={[styles.tabLabel, { color: textColor, fontWeight: isFocused ? '600' : '500' }]}
                numberOfLines={1}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name="list" options={{ title: 'Danh sách' }} />
      <Tabs.Screen name="library" options={{ title: 'Thư viện' }} />
      <Tabs.Screen name="downloads" options={{ title: 'Tải xuống' }} />
      <Tabs.Screen name="settings" options={{ title: 'Cài đặt' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: { 
    paddingTop: 12, 
    paddingHorizontal: 21,
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
    height: 64, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    alignItems: 'center' 
  },
  tabItem: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 4, 
    height: '100%', 
    borderRadius: 26 
  },
  tabLabel: { 
    fontSize: 10, 
    letterSpacing: 0.5 
  },
});
