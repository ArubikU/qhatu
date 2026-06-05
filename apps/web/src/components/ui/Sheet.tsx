'use client'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useEffect } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Max width on desktop (centered modal). Mobile = full-width bottom sheet. */
  maxWidth?: number
  /** Dismiss when dragging the sheet down past threshold. */
  dragToClose?: boolean
}

/**
 * Apple-style bottom sheet on mobile, centered modal on desktop.
 * Liquid-glass panel, spring physics, backdrop blur, drag-to-dismiss, Esc to close.
 */
export function Sheet({ open, onClose, children, maxWidth = 480, dragToClose = true }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 360 }}
            drag={dragToClose ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={dragToClose ? onDragEnd : undefined}
            className="fixed bottom-0 left-0 right-0 md:inset-0 md:flex md:items-center md:justify-center z-[61] pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full mx-auto liquid-glass rounded-t-[28px] md:rounded-[28px] md:my-8 overflow-hidden"
              style={{ maxWidth }}
            >
              {/* Drag handle (mobile) */}
              {dragToClose && (
                <div className="flex justify-center pt-3 md:hidden">
                  <span className="w-10 h-1.5 rounded-full bg-white/25" />
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
