'use client'
import { motion } from 'framer-motion'
import { Trash2, AlertTriangle, LogOut, Info } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { useUIStore, confirmAsync, type ConfirmConfig } from '@/store/uiStore'

const ICONS = { trash: Trash2, warning: AlertTriangle, logout: LogOut, info: Info }

/** Mount once at the app root. Renders the active confirm dialog. */
export function ConfirmHost() {
  const confirm   = useUIStore((s) => s.confirm)
  const resolve   = useUIStore((s) => s._resolveConfirm)
  const danger    = confirm.tone === 'danger'
  const Icon      = ICONS[confirm.icon ?? (danger ? 'warning' : 'info')]

  return (
    <Sheet open={confirm.open} onClose={() => resolve(false)} maxWidth={400} dragToClose={false}>
      <div className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 280, delay: 0.05 }}
          className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${danger ? 'bg-red-500/15' : 'bg-primary/15'}`}
        >
          <Icon size={28} className={danger ? 'text-red-400' : 'text-primary'} />
        </motion.div>
        <h2 className="text-lg font-bold text-white font-heading mb-1.5">{confirm.title}</h2>
        {confirm.message && <p className="text-sm text-white/55 font-body mb-6">{confirm.message}</p>}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => resolve(true)}
            className={`w-full py-3 rounded-2xl text-sm font-semibold font-heading text-white transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-[#6b2fe2]'}`}
          >
            {confirm.confirmLabel ?? (danger ? 'Eliminar' : 'Confirmar')}
          </button>
          <button
            type="button"
            onClick={() => resolve(false)}
            className="w-full py-3 rounded-2xl text-sm font-body text-white/55 hover:text-white hover:bg-white/5 transition-colors"
          >
            {confirm.cancelLabel ?? 'Cancelar'}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

/** Generic confirmation. `const ok = await confirm({title})`. */
export function useConfirm() {
  return (cfg: ConfirmConfig) => confirmAsync(cfg)
}

/** Destructive confirmation shorthand (danger tone). */
export function useDeny() {
  return (cfg: Omit<ConfirmConfig, 'tone'>) => confirmAsync({ tone: 'danger', icon: 'trash', ...cfg })
}
