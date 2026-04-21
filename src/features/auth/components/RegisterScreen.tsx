/**
 * @file RegisterScreen.tsx
 * @description Màn hình đăng ký — Dark Mode, AuthBackground SVG blobs.
 * @module features/auth
 */

import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Text,
  TextInput
} from 'react-native'

import { useState } from 'react'
import { useRouter } from 'expo-router'
import { createLogger } from '@core/logger'
import { useAuth } from '../hooks/useAuth'
import { COLORS } from '@shared/constants/colors'
import { GoogleIcon, FacebookIcon, AppleIcon } from '@shared/components/icons/SocialIcons'
import { AppLogo } from '@shared/components/ui/AppLogo'
import { SocialAuthButtons } from './SocialAuthButtons'
import { AuthBackground } from '@shared/components/ui/AuthBackground'

import { Mail, Lock, Eye, EyeOff, User, ChevronRight, CheckCircle, XCircle } from 'lucide-react-native'

const logger = createLogger('register-screen')

// ─── Input ─────────────────────────────────────────────────────────────────────

function AuthInput({
  value,
  onChangeText,
  placeholder,
  icon,
  secureEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  hasError = false
}: {
  value: string
  onChangeText: (t: string) => void
  placeholder: string
  icon: React.ReactNode
  secureEntry?: boolean
  keyboardType?: any
  autoCapitalize?: any
  hasError?: boolean
}) {
  const [hidden, setHidden] = useState(secureEntry)
  const [focused, setFocused] = useState(false)
  return (
    <View style={[styles.inputWrapper, focused && styles.inputFocused, hasError && styles.inputError]}>
      <View style={styles.inputIconBox}>{icon}</View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={hidden}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.inputText}
      />
      {secureEntry && (
        <Pressable onPress={() => setHidden(!hidden)} style={{ padding: 6 }}>
          {hidden ? <EyeOff size={18} color={COLORS.textMuted} /> : <Eye size={18} color={COLORS.primary} />}
        </Pressable>
      )}
    </View>
  )
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    { label: 'Ít nhất 6 ký tự', ok: password.length >= 6 },
    { label: 'Có chữ hoa', ok: /[A-Z]/.test(password) },
    { label: 'Có số hoặc ký tự đặc biệt', ok: /[0-9!@#$%^&*]/.test(password) }
  ]
  return (
    <View style={{ gap: 3, paddingHorizontal: 4, marginTop: -4 }}>
      {checks.map((c, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {c.ok ? <CheckCircle size={13} color={COLORS.success} /> : <XCircle size={13} color={COLORS.textMuted} />}
          <Text style={{ fontSize: 12, color: c.ok ? COLORS.success : COLORS.textMuted }}>{c.label}</Text>
        </View>
      ))}
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const { register, isLoading } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const mismatch = !!confirmPassword && confirmPassword !== password

  const handleRegister = async () => {
    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setError('')
    try {
      await register({ displayName: displayName.trim(), email: email.trim(), password, confirmPassword })
      router.replace('/(tabs)')
    } catch {
      setError('Đăng ký thất bại. Email đã được sử dụng.')
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <AuthBackground variant='register' />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoRow}>
          <AppLogo size={90} />
        </View>
        <Text style={styles.title}>Đăng ký</Text>
        <Text style={styles.subtitle}>Một tài khoản — vạn giai điệu không giới hạn ♫</Text>

        <View style={styles.form}>
          <AuthInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder='Tên hiển thị'
            autoCapitalize='words'
            icon={<User size={18} color={COLORS.textMuted} />}
          />
          <AuthInput
            value={email}
            onChangeText={setEmail}
            placeholder='Địa chỉ Email'
            keyboardType='email-address'
            icon={<Mail size={18} color={COLORS.textMuted} />}
          />
          <AuthInput
            value={password}
            onChangeText={setPassword}
            placeholder='Mật khẩu'
            secureEntry
            icon={<Lock size={18} color={COLORS.textMuted} />}
          />
          <PasswordStrength password={password} />
          <AuthInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder='Xác nhận mật khẩu'
            secureEntry
            hasError={mismatch}
            icon={<Lock size={18} color={mismatch ? COLORS.error : COLORS.textMuted} />}
          />
          {mismatch && <Text style={{ color: COLORS.error, fontSize: 12, marginTop: -6 }}>Mật khẩu chưa khớp</Text>}

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable onPress={handleRegister} disabled={isLoading}>
            <View style={styles.primaryBtn}>
              {isLoading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <View style={styles.primaryBtnInner}>
                  <Text style={styles.primaryBtnText}>Đăng ký</Text>
                  <ChevronRight size={18} color='#fff' />
                </View>
              )}
            </View>
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc đăng ký với</Text>
          <View style={styles.dividerLine} />
        </View>

        <SocialAuthButtons hideBiometric />

        <Text style={styles.terms}>
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <Text style={styles.termsLink} onPress={() => router.push('/auth/terms-of-service')}>
            Điều khoản dịch vụ
          </Text>{' '}
          và{' '}
          <Text style={styles.termsLink} onPress={() => router.push('/auth/privacy-policy')}>
            Chính sách bảo mật
          </Text>
        </Text>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Đã có tài khoản? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.loginLink}>Đăng nhập</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  logoRow: { alignItems: 'center', marginBottom: 16 },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
    letterSpacing: 0.3
  },

  form: { gap: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1A1A2E',
    borderWidth: 1.5,
    borderColor: '#2E2848',
    paddingHorizontal: 20
  },
  inputFocused: { borderColor: COLORS.primary, backgroundColor: '#1E1438' },
  inputError: { borderColor: COLORS.error },
  inputIconBox: { marginRight: 10 },
  inputText: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },

  errorBox: {
    backgroundColor: '#2A1520',
    borderRadius: 27,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#5A2030'
  },
  errorText: { color: COLORS.error, fontSize: 13 },

  primaryBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10
  },
  primaryBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerText: { color: COLORS.textMuted, fontSize: 12 },

  socialList: { gap: 10 },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: '#3D3558',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 20,
    gap: 12
  },
  socialBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },

  terms: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 20, lineHeight: 18 },
  termsLink: { color: COLORS.primary, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loginText: { color: COLORS.textSecondary, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' }
})
