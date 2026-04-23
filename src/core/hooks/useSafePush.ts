/**
 * @file useSafePush.ts
 * @description Hook giúp chặn hiện tượng bấm đúp (double tap) mở 2 trang chồng lên nhau khi dùng router.push.
 * @module core/hooks
 */

import { useCallback, useRef } from 'react'
import { useRouter, Href } from 'expo-router'

export function useSafePush() {
  const router = useRouter()
  const isNavigating = useRef(false)

  const safePush = useCallback(
    (url: Href) => {
      // Nếu đang trong quá trình chuyển trang thì chặn luôn
      if (isNavigating.current) return

      // Bật cờ khóa
      isNavigating.current = true
      
      // Thực hiện chuyển trang
      router.push(url)

      // Mở khóa sau 500ms (Đủ thời gian cho animation chuyển màn hình hoàn tất)
      setTimeout(() => {
        isNavigating.current = false
      }, 500)
    },
    [router]
  )

  return safePush
}
