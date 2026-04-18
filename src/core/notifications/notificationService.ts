/**
 * @file notificationService.ts
 * @description Service quản lý push notifications và local notifications.
 * Xử lý xin quyền, đăng ký token, hiển thị notification khi có bài hát mới.
 * @module core/notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { createLogger } from '@core/logger';

const logger = createLogger('notifications');

/**
 * Cấu hình cách hiển thị notification khi app đang mở (foreground).
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Xin quyền gửi notification từ người dùng.
 * Trên Android 13+ và iOS đều cần quyền rõ ràng.
 *
 * @returns true nếu được cấp quyền, false nếu bị từ chối
 */
export async function requestPermissions(): Promise<boolean> {
  logger.info('Xin quyền notification');

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    logger.debug('Quyền notification đã được cấp trước đó');
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();

  if (status === 'granted') {
    logger.info('Người dùng đồng ý cấp quyền notification');
    return true;
  }

  logger.warn('Người dùng từ chối quyền notification', { status });
  return false;
}

/**
 * Lấy Expo Push Token để đăng ký nhận push notification từ server.
 *
 * @returns Push token string hoặc null nếu không lấy được
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    // Push token chỉ hoạt động trên thiết bị thật, không hoạt động trên simulator
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Mặc định',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    logger.info('Lấy push token thành công', { token: tokenData.data.slice(0, 20) + '...' });
    return tokenData.data;
  } catch (error) {
    logger.error('Không thể lấy push token', error);
    return null;
  }
}

/**
 * Gửi local notification — dùng cho thông báo nhạc mới, tải xong, v.v.
 *
 * @param title - Tiêu đề notification
 * @param body - Nội dung notification
 * @param data - Dữ liệu bổ sung (ví dụ: trackId để deep link)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  logger.debug('Gửi local notification', { title });

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
    },
    trigger: null, // Hiển thị ngay lập tức
  });
}
