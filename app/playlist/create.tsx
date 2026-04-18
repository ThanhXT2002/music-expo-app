/**
 * @file playlist/create.tsx
 * @description Route tạo playlist mới — hiển thị dạng modal.
 * @module app/playlist
 */

import { CreatePlaylistModal } from '@features/playlist/components/CreatePlaylistModal';

/**
 * Route tạo playlist — modal form.
 */
export default function CreatePlaylistRoute() {
  return <CreatePlaylistModal />;
}
