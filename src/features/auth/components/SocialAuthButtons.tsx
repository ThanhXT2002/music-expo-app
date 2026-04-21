/**
 * @file SocialAuthButtons.tsx
 * @description Component dùng chung cho các nút đăng nhập bằng mạng xã hội / sinh trắc học
 * @module features/auth/components
 */

import { View, Pressable, StyleSheet, Alert, Text } from 'react-native'

import { useRouter } from 'expo-router'
import * as LocalAuthentication from 'expo-local-authentication'
import { Fingerprint } from 'lucide-react-native'
import { GoogleIcon, FacebookIcon } from '@shared/components/icons/SocialIcons'
import { COLORS } from '@shared/constants/colors'
import { createLogger } from '@core/logger'
import { useAuth } from '../hooks/useAuth'

const logger = createLogger('social-auth-buttons')

export function SocialAuthButtons({ hideBiometric = false }: { hideBiometric?: boolean }) {
  const { restoreSession, loginWithGoogle, loginWithFacebook } = useAuth()
  const router = useRouter()

  const handleBiometricLogin = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      if (!hasHardware) {
        Alert.alert('Lỗi', 'Thiết bị không hỗ trợ Sinh trắc học.')
        return
      }

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Đăng nhập vào XTMusic',
        disableDeviceFallback: true
      })

      if (authResult.success) {
        logger.info('Sinh trắc học thành công, khôi phục session')
        await restoreSession()
        router.replace('/(tabs)')
      }
    } catch (e: any) {
      logger.error('Lỗi sinh trắc học', e)
      Alert.alert('Thất bại', 'Xác thực sinh trắc học không thành công.')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      router.replace('/(tabs)')
    } catch (e: any) {
      logger.error('Lỗi Google login', e)
      Alert.alert('Thất bại', 'Đăng nhập Google không thành công.')
    }
  }

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook()
      router.replace('/(tabs)')
    } catch (e: any) {
      logger.error('Lỗi Facebook login', e)
      Alert.alert('Thất bại', 'Đăng nhập Facebook không thành công.')
    }
  }

  return (
    <View style={styles.socialList}>
      {!hideBiometric && (
        <Pressable onPress={handleBiometricLogin}>
          <View style={[styles.socialBtn, { backgroundColor: '#1C1235', borderColor: '#6B3FA0' }]}>
            <Fingerprint size={20} color={COLORS.primary} />
            <Text style={[styles.socialBtnText, { color: COLORS.primary }]}>Đăng nhập bằng sinh trắc học</Text>
          </View>
        </Pressable>
      )}

      <Pressable onPress={handleGoogleLogin}>
        <View style={[styles.socialBtn, { backgroundColor: '#1A1A2E', borderColor: '#3D3558' }]}>
          <GoogleIcon size={20} />
          <Text style={styles.socialBtnText}>Tiếp tục với Google</Text>
        </View>
      </Pressable>

      <Pressable onPress={handleFacebookLogin}>
        <View style={[styles.socialBtn, { backgroundColor: '#1D2A4A', borderColor: '#405B9C' }]}>
          <FacebookIcon size={20} />
          <Text style={styles.socialBtnText}>Tiếp tục với Facebook</Text>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  socialList: { gap: 12, marginBottom: 24 },
  socialBtn: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  socialBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary }
})
