'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Dice5, Check, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/common/Avatar'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10)
}

interface Props {
  open: boolean
  onClose: () => void
  currentSeed: string
  frameId?: string | null
}

/** Modal to change the generated avatar — re-roll seed or pick from options. */
export function AvatarPicker({ open, onClose, currentSeed, frameId }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const setAuth     = useAuthStore((s) => s.setAuth)
  const user        = useAuthStore((s) => s.user)
  const qc          = useQueryClient()

  const [selected, setSelected] = useState(currentSeed)
  const [options, setOptions]   = useState<string[]>(() => [currentSeed, ...Array.from({ length: 7 }, randomSeed)])
  const [saving, setSaving]     = useState(false)

  const reroll = () => setOptions([selected, ...Array.from({ length: 7 }, randomSeed)])

  const save = async () => {
    if (!accessToken || selected === currentSeed) { onClose(); return }
    setSaving(true)
    try {
      await api.users.updateAvatar(selected, accessToken)
      if (user) setAuth(accessToken, { ...user, avatarSeed: selected })
      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['feed'] })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:inset-0 md:flex md:items-center md:justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto w-full md:max-w-sm liquid-glass md:rounded-3xl rounded-t-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold font-heading">Cambiar avatar</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {/* Preview */}
              <div className="flex justify-center mb-5">
                <Avatar seed={selected} size={88} frameId={frameId} />
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {options.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelected(s)}
                    className={`relative rounded-2xl p-1.5 transition-all ${selected === s ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-white/5'}`}
                  >
                    <Avatar seed={s} size={48} />
                    {selected === s && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check size={11} className="text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={reroll}
                  className="flex items-center justify-center gap-2 flex-1 bg-white/5 hover:bg-white/10 text-white/80 py-3 rounded-2xl text-sm font-body transition-colors"
                >
                  <Dice5 size={16} /> Generar más
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 flex-1 bg-primary hover:bg-[#6b2fe2] disabled:opacity-50 text-white py-3 rounded-2xl text-sm font-semibold font-heading transition-colors"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Guardar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
