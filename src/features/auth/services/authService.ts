/**
 * @file authService.ts
 * @description Service giao tiếp với API xác thực.
 * Token được lưu vào secureStorage — Axios interceptor tự đọc mỗi request.
 * Không cần setAuthToken thủ công nữa.
 * @module features/auth/services
 */

import { apiClient } from '@core/api/apiClient';
import { API_ENDPOINTS } from '@core/api/endpoints';
import { createLogger } from '@core/logger';
import * as secureStorage from '@core/storage/secureStorage';
import type { AuthSession } from '@shared/types/user';
import type { LoginFormData, RegisterFormData } from '../types';

// Firebase imports
import { auth } from '@shared/config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile, signInWithCredential, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

const logger = createLogger('auth-service');

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
logger.info(`[DEBUG] webClientId = "${WEB_CLIENT_ID}"`);

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
});

/**
 * Gửi Firebase Token lên BE để lấy App JWT.
 */
async function syncTokenWithBackend(firebaseIdToken: string): Promise<AuthSession> {
  const response = await apiClient.post<any>('/auth/sync', {
    token: firebaseIdToken
  });

  const payload = response.data.data;

  const session: AuthSession = {
    accessToken: payload.token.access_token,
    refreshToken: '',
    expiresAt: '',
    user: payload.user
  };

  await secureStorage.setSecureItem(secureStorage.SECURE_KEYS.ACCESS_TOKEN, session.accessToken);
  return session;
}

export async function login(data: LoginFormData): Promise<AuthSession> {
  logger.info('Đăng nhập bằng Email/Password qua Firebase');
  const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
  const idToken = await userCredential.user.getIdToken(true);

  return await syncTokenWithBackend(idToken);
}

export async function register(data: RegisterFormData): Promise<AuthSession> {
  logger.info('Đăng ký bằng Email/Password qua Firebase');
  const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

  // Cap nhat ten hien thi tren Firebase
  if (data.displayName) {
    await updateProfile(userCredential.user, { displayName: data.displayName });
  }

  const idToken = await userCredential.user.getIdToken(true);
  return await syncTokenWithBackend(idToken);
}

export async function forgotPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logout(): Promise<void> {
  logger.info('Đăng xuất');
  try {
    await auth.signOut();
  } catch (e) {
    logger.warn('Lỗi Firebase signOut', e);
  }
  await secureStorage.clearSecureStorage();
}

/**
 * Khoi phuc session local.
 * Neu co token -> BE verify tra ve user info.
 */
export async function restoreSession(): Promise<AuthSession | null> {
  logger.info('Khôi phục session');
  const token = await secureStorage.getSecureItem('ACCESS_TOKEN');

  if (!token) {
    return null;
  }

  try {
    // API '/users/me' can BE config endpoint de GET profile
    const response = await apiClient.get<any>('/users/me');

    return {
      accessToken: token,
      refreshToken: '',
      expiresAt: '',
      user: response.data.data,
    };
  } catch (error) {
    logger.warn('Token hết hạn hoặc server lỗi — xoá session');
    await secureStorage.clearSecureStorage();
    return null;
  }
}

export async function loginWithGoogle(): Promise<AuthSession> {
  logger.info('Đăng nhập bằng Google Account');
  
  // 1. Kích hoạt Check & lấy Google Token từ thiết bị
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  
  if (!response.data?.idToken) {
    throw new Error('Không lấy được Google ID Token');
  }

  // 2. Wrap thành Firebase Credential
  const credential = GoogleAuthProvider.credential(response.data.idToken);

  // 3. Đăng nhập Firebase
  const userCredential = await signInWithCredential(auth, credential);
  
  // 4. Lấy Firebase Token mới
  const firebaseToken = await userCredential.user.getIdToken(true);
  
  // 5. Gửi sang FastAPI Backend để lấy JWT và sync data
  return await syncTokenWithBackend(firebaseToken);
}

export async function loginWithFacebook(): Promise<AuthSession> {
  logger.info('Đăng nhập bằng Facebook Account');

  // 1. Mở Cửa sổ uỷ quyền trên hệ thống Native
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
  
  if (result.isCancelled) {
    throw new Error('Đăng nhập Facebook bị huỷ');
  }

  // 2. Lấy Access Token từ Native
  const data = await AccessToken.getCurrentAccessToken();
  if (!data) {
    throw new Error('Không lấy được Facebook Access Token');
  }

  // 3. Wrap vào Firebase Credential
  const credential = FacebookAuthProvider.credential(data.accessToken);

  // 4. Xác nhận Đăng nhập với Firebase
  const userCredential = await signInWithCredential(auth, credential);
  
  // 5. Lấy Firebase Token mới
  const firebaseToken = await userCredential.user.getIdToken(true);
  
  // 6. Chuyển sang Backend Đồng bộ Data
  return await syncTokenWithBackend(firebaseToken);
}
