/**
 * @file settings.tsx
 * @description Tab Cài đặt — Nơi đổi giao diện, thông báo, tài khoản và Đăng xuất.
 * @module app/(tabs)
 */

import { View, ScrollView, Pressable, StyleSheet, Switch, Alert, Text, Dimensions, Image } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { User, Bell, Palette, Shield, LogOut, ChevronRight, Info, HelpCircle, FileText, ShieldCheck, ArrowLeftRight } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, SHADOWS } from '@shared/constants/spacing'
import { useAuth } from '@features/auth/hooks/useAuth'
import { GlassCard } from '@shared/components/GlassCard'
import { useTabBarStore } from '@shared/store/tabBarStore'

const MOOD_BEAT_COLORS = {
  primary: '#6C5CE7',
  secondary: '#A29BFE',
  accent: '#00D2FF',
  textSecondary: 'rgba(255,255,255,0.7)',
  disabled: 'rgba(255,255,255,0.4)',
}

// ─── Settings Section Component ───────────────────────────────────────────────

function SettingItem({
  icon,
  title,
  subtitle,
  rightElement,
  onPress,
  danger
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  rightElement?: React.ReactNode
  onPress?: () => void
  danger?: boolean
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      {({ pressed }) => (
        <View style={[styles.settingItem, pressed && onPress && styles.settingItemPressed]}>
          <View style={[styles.iconWrapper, danger && { backgroundColor: 'rgba(255, 65, 91, 0.15)' }]}>{icon}</View>
          <View style={styles.itemTextContent}>
            <Text style={[styles.itemTitle, danger && { color: COLORS.error }]}>{title}</Text>
            {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
          </View>
          {rightElement ? rightElement : onPress && <ChevronRight size={20} color={MOOD_BEAT_COLORS.disabled} />}
        </View>
      )}
    </Pressable>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { searchPosition, toggleSearchPosition } = useTabBarStore()

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout()
          // Auth guard sẽ tự động đẩy về /auth/login
        }
      }
    ])
  }

  return (
    <View style={styles.container}>
      {/* Cực tím Gradient background ở top - Mood Beat Style */}
      <LinearGradient
        colors={['rgba(108, 92, 231, 0.3)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.ambientTopGlow}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Profile Card --- */}
        {user && (
          <GlassCard style={styles.profileCardWrapper}>
            <View style={styles.profileCard}>
              <LinearGradient
                colors={[MOOD_BEAT_COLORS.primary, MOOD_BEAT_COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarPlaceholder}
              >
                <Image 
                  source={
                    user.profile_picture 
                      ? { uri: user.profile_picture } 
                      : (process.env.EXPO_PUBLIC_USER_DEFAULT_IMG && process.env.EXPO_PUBLIC_USER_DEFAULT_IMG.startsWith('http')
                          ? { uri: process.env.EXPO_PUBLIC_USER_DEFAULT_IMG }
                          : require('../../assets/images/user-default.png')) // Fallback ảnh local
                  } 
                  style={styles.avatarImage} 
                />
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* --- Sections --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>
          <GlassCard style={styles.sectionCardWrapper}>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={<User size={20} color={MOOD_BEAT_COLORS.primary} />}
                title='Thông tin cá nhân'
                subtitle='Tên, Email, Sinh trắc học'
                onPress={() => router.navigate('/settings/profile')}
              />
              <SettingItem
                icon={<Shield size={20} color={MOOD_BEAT_COLORS.accent} />}
                title='Quyền riêng tư'
                onPress={() => router.navigate('/settings/privacy-settings')}
              />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TÙY CHỈNH</Text>
          <GlassCard style={styles.sectionCardWrapper}>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={<Bell size={20} color={MOOD_BEAT_COLORS.secondary} />}
                title='Thông báo'
                rightElement={<Switch value={true} trackColor={{ true: MOOD_BEAT_COLORS.primary, false: 'rgba(255,255,255,0.2)' }} thumbColor={'#FFFFFF'} />}
              />
              <SettingItem
                icon={<ArrowLeftRight size={20} color={MOOD_BEAT_COLORS.accent} />}
                title='Mini Player bên phải'
                subtitle={searchPosition === 'right' ? 'Đang ở bên phải' : 'Đang ở bên trái (mặc định)'}
                rightElement={
                  <Switch
                    value={searchPosition === 'right'}
                    onValueChange={toggleSearchPosition}
                    trackColor={{ true: MOOD_BEAT_COLORS.primary, false: 'rgba(255,255,255,0.2)' }}
                    thumbColor='#FFFFFF'
                  />
                }
              />
              <SettingItem
                icon={<Palette size={20} color={MOOD_BEAT_COLORS.primary} />}
                title='Chủ đề & Hiển thị'
                subtitle='Dark Mode - Mood Beat'
                onPress={() => router.navigate('/settings/theme')}
              />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KHÁC</Text>
          <GlassCard style={styles.sectionCardWrapper}>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={<HelpCircle size={20} color={MOOD_BEAT_COLORS.accent} />}
                title='Trợ giúp & Hỗ trợ'
                onPress={() => router.navigate('/settings/help')}
              />
              <SettingItem
                icon={<FileText size={20} color={MOOD_BEAT_COLORS.textSecondary} />}
                title='Điều khoản sử dụng'
                onPress={() => router.navigate('/terms-of-service')}
              />
              <SettingItem
                icon={<ShieldCheck size={20} color={MOOD_BEAT_COLORS.accent} />}
                title='Chính sách bảo mật'
                onPress={() => router.navigate('/privacy-policy')}
              />
              <SettingItem
                icon={<Info size={20} color={MOOD_BEAT_COLORS.textSecondary} />}
                title='Thông tin ứng dụng'
                subtitle='Phiên bản 1.0.0'
                onPress={() => router.navigate('/settings/app-info')}
              />
              <SettingItem
                icon={<LogOut size={20} color={COLORS.error} />}
                title='Đăng xuất'
                danger
                onPress={handleLogout}
              />
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0C29' // Dark Base theo Mood Beat Style
  },
  ambientTopGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg // Tách nhỏ để không quá sát xuống header
  },
  headerTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: '#FFFFFF'
  },

  // Profile Card
  profileCardWrapper: {
    padding: 0,
    marginBottom: SPACING['2xl'], // 24px (Section spacing)
    borderRadius: RADIUS.xl, // Border radius: 16px - 24px
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg // Padding 16px
  },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.lg, shadowColor: MOOD_BEAT_COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 32 },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 18, // Subtitle: 18px Medium
    fontWeight: '500', // Medium
    color: '#FFFFFF',
    marginBottom: 4,
    textTransform: 'capitalize'
  },
  profileEmail: {
    fontSize: 14, // Body: 14px Regular
    color: 'rgba(255,255,255,0.7)' // Secondary Text
  },

  // Sections
  section: {
    marginBottom: SPACING['2xl'], // Section spacing: 24px
  },
  sectionTitle: {
    fontSize: 12, // Caption: 12px Light
    fontWeight: '300', // Light
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.md, // Card gap: 12px (hoặc tương tự cho title => card)
    marginLeft: 4,
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  sectionCardWrapper: {
    padding: 0,
    borderRadius: RADIUS.xl // 20px
  },
  sectionContent: {
    // GlassCard handles background and borders, so we just remove these
    overflow: 'hidden'
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg, // Padding: 16px
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)' // Subtle separator
  },
  settingItemPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)' // Glass effect bump
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full, // 12px
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  itemTextContent: {
    flex: 1,
    justifyContent: 'center'
  },
  itemTitle: {
    fontSize: 14, // Body: 14px Regular
    fontWeight: '400',
    color: '#FFFFFF'
  },
  itemSubtitle: {
    fontSize: 12, // Caption: 12px
    color: 'rgba(255,255,255,0.7)', // Secondary text
    marginTop: 2
  }
})
