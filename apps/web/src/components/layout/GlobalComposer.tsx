'use client'
import { useUIStore } from '@/store/uiStore'
import { CreatePostModal } from '@/components/posts/CreatePostModal'

/** Single global composer instance — opened from any FAB via uiStore. */
export function GlobalComposer() {
  const open  = useUIStore((s) => s.composeOpen)
  const close = useUIStore((s) => s.closeCompose)
  return <CreatePostModal open={open} onClose={close} />
}
