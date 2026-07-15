import type { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'

type AppRouter = ReturnType<typeof useRouter>

/**
 * Navegación SPA robusta.
 *
 * Bug en prod: router.push arranca una transición de React (App Router) que no
 * commitea sola — la URL ni cambia — hasta que llega un update síncrono (p.ej.
 * abrir/cerrar el composer). Reproducido: pushState+popstate actualiza usePathname
 * pero el segmento no swapea; cualquier setState síncrono lo descarga.
 *
 * Fix: tras router.push, bumpeamos un tick de estado (Zustand) que re-renderiza
 * <NavFlush/> → React flushea la transición pendiente → nav SPA sin recarga dura.
 * Reintentamos unas veces por si la transición aún no estaba encolada. location.assign
 * queda SOLO como red de seguridad final (no debería dispararse casi nunca).
 */
export function pushWithFallback(router: AppRouter, href: string): void {
  if (typeof window === 'undefined') return
  const current = window.location.pathname + window.location.search
  if (current === href) return

  const bump = useUIStore.getState().bumpNav
  const changed = () => (window.location.pathname + window.location.search) !== current

  try { router.push(href) } catch { window.location.assign(href); return }

  // Flush síncrono en varios ticks hasta que la URL cambie (transición commiteada).
  const delays = [0, 60, 160, 320, 600]
  delays.forEach((d) => window.setTimeout(() => { if (!changed()) bump() }, d))

  // Red de seguridad: si nada funcionó a los 1.2s, recarga dura (raro).
  window.setTimeout(() => { if (!changed()) window.location.assign(href) }, 1200)
}
