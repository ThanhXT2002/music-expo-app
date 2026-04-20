/**
 * @file settings.tsx
 * @description Tab Cài đặt — Nơi đổi giao diện, thông báo, tài khoản và Đăng xuất.
 * @module app/(tabs)
 */

import { View, Text, ScrollView, Pressable, StyleSheet, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Bell, Palette, Shield, LogOut, ChevronRight, Info } from 'lucide-react-native';
import { COLORS } from '@shared/constants/colors';
import { useAuth } from '@features/auth/hooks/useAuth';
import { GlassCard } from '@shared/components/GlassCard';

// ─── Settings Section Component ───────────────────────────────────────────────

function SettingItem({
  icon, title, subtitle, rightElement, onPress, danger
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      {({ pressed }) => (
        <View style={[
          styles.settingItem,
          pressed && onPress && styles.settingItemPressed
        ]}>
          <View style={[styles.iconWrapper, danger && { backgroundColor: 'rgba(255, 65, 91, 0.1)' }]}>
            {icon}
          </View>
          <View style={styles.itemTextContent}>
            <Text style={[styles.itemTitle, danger && { color: COLORS.error }]}>{title}</Text>
            {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
          </View>
          {rightElement ? rightElement : (onPress && <ChevronRight size={20} color={COLORS.textMuted} />)}
        </View>
      )}
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Auth guard sẽ tự động đẩy về /auth/login
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Cài đặt</Text>

        {/* --- Profile Card --- */}
        {user && (
          <GlassCard style={styles.profileCardWrapper}>
            <View style={styles.profileCard}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user.name ? user.name[0].toUpperCase() : 'U'}</Text>
              </View>
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
                icon={<User size={20} color={COLORS.primary} />}
                title="Thông tin cá nhân"
                subtitle="Tên, Email, Sinh trắc học"
                onPress={() => {}}
              />
              <SettingItem
                icon={<Shield size={20} color={COLORS.success} />}
                title="Quyền riêng tư"
                onPress={() => {}}
              />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TÙY CHỈNH</Text>
          <GlassCard style={styles.sectionCardWrapper}>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={<Bell size={20} color={COLORS.warning} />}
                title="Thông báo"
                rightElement={<Switch value={true} trackColor={{ true: COLORS.primary, false: COLORS.border }} />}
              />
              <SettingItem
                icon={<Palette size={20} color={COLORS.info} />}
                title="Chủ đề & Hiển thị"
                subtitle="Ban đêm (Mặc định)"
                onPress={() => {}}
              />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KHÁC</Text>
          <GlassCard style={styles.sectionCardWrapper}>
            <View style={styles.sectionContent}>
              <SettingItem
                icon={<Info size={20} color={COLORS.textSecondary} />}
                title="Thông tin ứng dụng"
                subtitle="Phiên bản 1.0.0"
                onPress={() => {}}
              />
              <SettingItem
                icon={<LogOut size={20} color={COLORS.error} />}
                title="Đăng xuất"
                danger
                onPress={handleLogout}
              />
            </View>
          </GlassCard>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 24,
    letterSpacing: -0.5,
  },

  // Profile Card
  profileCardWrapper: {
    padding: 0,
    marginBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1,
  },
  sectionCardWrapper: {
    padding: 0,
  },
  sectionContent: {
    // GlassCard handles background and borders, so we just remove these
    overflow: 'hidden',
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  settingItemPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  itemSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
