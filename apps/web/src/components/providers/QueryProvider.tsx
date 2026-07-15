'use client'
import { QueryClientProvider, notifyManager } from '@tanstack/react-query'
import { flushSync } from 'react-dom'
import { queryClient } from '@/lib/queryClient'

// ─── Fix del scheduler ────────────────────────────────────────────────────────
// En prod, el trabajo concurrente/async de React no se commitea solo hasta un
// evento de input discreto: las notificaciones de react-query (resolución de
// queries, mutaciones) quedaban pendientes y el feed/perfil/equipar no
// actualizaban hasta clickear. Forzamos que react-query notifique dentro de
// flushSync → el commit es síncrono e inmediato, sin depender del scheduler.
// (setBatchNotifyFunction es API documentada de react-query para esto.)
if (typeof window !== 'undefined') {
  notifyManager.setBatchNotifyFunction((cb) => {
    try { flushSync(cb) } catch { cb() }
  })
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
