'use client'
import { useEffect } from 'react'
import { flushSync } from 'react-dom'

/**
 * Kick global del scheduler.
 *
 * En prod, el scheduler concurrente de React no flushea su cola de trabajo async
 * por sí solo (transiciones de navegación, callbacks de mutación de react-query,
 * resoluciones de query) — todo queda pendiente hasta el próximo evento de input
 * discreto (un click). Se reprodujo: navegar/equipar/cargar datos no commitea hasta
 * clickear. rAF sí corre normal, así que en cada frame forzamos un flush síncrono
 * del trabajo pendiente con flushSync. Cuando no hay nada pendiente es casi gratis.
 */
export function SchedulerKick() {
  useEffect(() => {
    let raf = 0
    let alive = true
    const loop = () => {
      if (!alive) return
      // flushSync con callback vacío fuerza a React a procesar/commitear cualquier
      // update pendiente de forma síncrona, sin depender del scheduler atascado.
      try { flushSync(() => {}) } catch { /* noop si se llama en mal momento */ }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { alive = false; cancelAnimationFrame(raf) }
  }, [])
  return null
}
