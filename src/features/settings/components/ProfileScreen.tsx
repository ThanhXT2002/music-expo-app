/**
 * @file ProfileScreen.tsx
 * @description Màn hình Hồ sơ cá nhân - Hiển thị & chỉnh sửa Tên, Tiẻu sử.
 * @module features/settings
 */

import { View, ScrollView, Pressable, StyleSheet, Text, TextInput, Alert, Keyboard, Image } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, User, Mail, Camera, Key } from 'lucide-react-native'
import { GlassIconButton } from '@shared/components/GlassIconButton'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'
import { GlassCard } from '@shared/components/GlassCard'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@features/auth/hooks/useAuth'

const MOOD_BEAT_COLORS = {
  primary: '#B026FF',     // Neon Purple
  secondary: '#00D2FF',   // Cyan
  accent: '#FF007A',      // Neon Pink
  background: '#0F0C29',  // Dark Space
  cardBg: 'rgba(255, 255, 255, 0.05)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)'
}

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()

  const [name, setName] = useState(user?.name || '')

  const handleSave = () => {
    Keyboard.dismiss()
    Alert.alert('Thành công', 'Thông tin của bạn đã được cập nhật thành công!')
  }

  const handleChangePassword = () => {
    Alert.prompt(
      'Xác thực bảo mật',
      'Vui lòng nhập mật khẩu hiện tại của bạn để tiến hành thay đổi.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Tiếp tục', onPress: () => Alert.alert('Đã gửi liên kết', 'Chúng tôi đã gửi link đặt lại mật khẩu vào email của bạn.') }
      ],
      'secure-text'
    )
  }

  return (
    <View style={styles.container}>
      {/* Ambient Background Glow */}
      <LinearGradient
        colors={['rgba(176, 38, 255, 0.15)', 'transparent']}
        style={styles.ambientGlow}
      />

      {/* Header */}
      <View style={[styles.headerRow, { paddingTop: insets.top + SPACING.md }]}>
        <GlassIconButton size={44} onPress={() => router.back()}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </GlassIconButton>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        <Pressable
          style={[styles.saveBtn, name !== user?.name && styles.saveBtnActive]}
          onPress={handleSave}
          disabled={name === user?.name}
        >
          <Text style={[styles.saveText, name !== user?.name && styles.saveTextActive]}>Lưu</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[MOOD_BEAT_COLORS.primary, MOOD_BEAT_COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarContainer}
          >
            {user?.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{user?.name ? user.name[0].toUpperCase() : 'U'}</Text>
            )}
            <Pressable style={styles.editAvatarBtn}>
              <Camera size={16} color="#FFFFFF" />
            </Pressable>
          </LinearGradient>
        </View>

        {/* Info Form */}
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
        <GlassCard style={styles.formCard}>
          <View style={styles.inputGroup}>
            <View style={styles.inputRow}>
              <User size={20} color={MOOD_BEAT_COLORS.primary} />
              <View style={styles.inputStack}>
                <Text style={styles.inputLabel}>Tên hiển thị</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>
            </View>
          </View>

          <View style={[styles.inputGroup, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
            <View style={styles.inputRow}>
              <Mail size={20} color={MOOD_BEAT_COLORS.secondary} />
              <View style={styles.inputStack}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  defaultValue={user?.email || ''}
                  editable={false}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Change Password */}
        <Text style={styles.sectionTitle}>Bảo mật</Text>
        <GlassCard style={[styles.formCard, { padding: 0 }]}>
          <Pressable style={styles.actionBtn} onPress={handleChangePassword}>
            <Key size={20} color={MOOD_BEAT_COLORS.accent} />
            <Text style={styles.actionBtnText}>Đổi mật khẩu</Text>
          </Pressable>
        </GlassCard>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MOOD_BEAT_COLORS.background,
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveBtn: {
    width: 60,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBtnActive: {
    backgroundColor: MOOD_BEAT_COLORS.primary
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)'
  },
  saveTextActive: {
    color: '#FFFFFF'
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING['2xl'],
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1235',
    borderWidth: 2,
    borderColor: MOOD_BEAT_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm
  },
  formCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.xl
  },
  inputGroup: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  inputStack: {
    flex: 1
  },
  inputLabel: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4
  },
  input: {
    fontSize: FONT_SIZE.md,
    color: '#FFFFFF',
    fontWeight: '500',
    padding: 0
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md
  },
  actionBtnText: {
    fontSize: FONT_SIZE.md,
    color: '#FFFFFF',
    fontWeight: '600'
  }
})
