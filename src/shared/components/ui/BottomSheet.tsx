/**
 * @file BottomSheet.tsx
 * @description Component bottom sheet — panel trượt lên từ dưới cùng màn hình.
 * Dùng cho menu ngữ cảnh, tuỳ chọn bài hát, thêm vào playlist, v.v.
 * @module shared/components/ui
 */

import { Modal, Pressable, View } from 'react-native';
import { ReactNode } from 'react';

/**
 * Props của BottomSheet.
 */
interface BottomSheetProps {
  /** Hiển thị bottom sheet */
  visible: boolean;
  /** Hàm đóng bottom sheet */
  onClose: () => void;
  /** Nội dung bên trong */
  children: ReactNode;
  /** Class Tailwind bổ sung cho container */
  className?: string;
}

/**
 * BottomSheet — panel trượt lên từ dưới cùng.
 * Nhấn vào overlay phía trên để đóng.
 *
 * @example
 * <BottomSheet visible={showOptions} onClose={() => setShowOptions(false)}>
 *   <TrackOptions track={selectedTrack} />
 * </BottomSheet>
 */
export function BottomSheet({ visible, onClose, children, className = '' }: BottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Overlay mờ — nhấn để đóng */}
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />

      {/* Nội dung bottom sheet */}
      <View
        className={`rounded-t-3xl bg-[#1A1A2E] px-4 pb-8 pt-4 ${className}`}
      >
        {/* Handle bar — thanh kéo ở trên cùng */}
        <View className="mb-4 self-center">
          <View className="h-1 w-10 rounded-full bg-[#6B6B6B]" />
        </View>

        {children}
      </View>
    </Modal>
  );
}
