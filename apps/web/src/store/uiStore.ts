'use client'
import { create } from 'zustand'

export interface ConfirmConfig {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  icon?: 'trash' | 'warning' | 'logout' | 'info'
}

interface ConfirmState extends ConfirmConfig {
  open: boolean
  resolve?: (ok: boolean) => void
}

interface UIState {
  // Global composer
  composeOpen: boolean
  openCompose: () => void
  closeCompose: () => void

  // Confirm dialog (promise-based)
  confirm: ConfirmState
  _openConfirm: (cfg: ConfirmConfig, resolve: (ok: boolean) => void) => void
  _resolveConfirm: (ok: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  composeOpen: false,
  openCompose:  () => set({ composeOpen: true }),
  closeCompose: () => set({ composeOpen: false }),

  confirm: { open: false, title: '' },
  _openConfirm: (cfg, resolve) => set({ confirm: { ...cfg, open: true, resolve } }),
  _resolveConfirm: (ok) => {
    get().confirm.resolve?.(ok)
    set((s) => ({ confirm: { ...s.confirm, open: false, resolve: undefined } }))
  },
}))

/** Promise-based confirmation. `await confirm({...})` → boolean. */
export function confirmAsync(cfg: ConfirmConfig): Promise<boolean> {
  return new Promise((resolve) => useUIStore.getState()._openConfirm(cfg, resolve))
}
