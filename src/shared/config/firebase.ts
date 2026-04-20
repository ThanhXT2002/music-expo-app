import { initializeApp } from 'firebase/app';
// @ts-ignore - Firebase SDK thieu definition cho getReactNativePersistence tren TS
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cau hinh API Key danh cho ung dung Web cua Firebase SDK
// Do du an khong he co file .env frontend nay nen se phai bo sung vao day.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// Khoi tao auth voi React Native Persistence
// Viec nay hoan toan cham dut Warning cua Firebase trong ReactNative/Expo hien dai
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
