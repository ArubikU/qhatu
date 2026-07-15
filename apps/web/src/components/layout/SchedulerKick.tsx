'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Kick global del scheduler.
 *
 * En prod el scheduler concurrente de React no flushea su cola de trabajo async
 * por sí solo (restauración de auth, callbacks de mutación de react-query,
 * resoluciones de query, transiciones de navegación): todo queda pendiente hasta
 * el próximo evento de INPUT DISCRETO. Comprobado: clickear un tab/botón descarga
 * de golpe todo lo pendiente; nada más lo hace (ni timers, ni flushSync).
 *
 * Fix: cada 60ms disparamos un click sintético sobre un <span> oculto que tiene un
 * onClick con setState. React procesa ese click como evento discreto → corre el
 * setState síncrono → flushea TODO el trabajo pendiente. Replica exactamente el
 * "clickeá algo y aparece". Sin robar foco (dispatchEvent no mueve el foco) y sin
 * tocar el resto de la UI (el span está oculto y aislado).
 */
export function SchedulerKick() {
  const ref = useRef<HTMLSpanElement>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const id = setInterval(() => {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }, 60)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      ref={ref}
      onClick={() => setTick((t) => (t + 1) % 1_000_000)}
      style={{ display: 'none' }}
      aria-hidden
    />
  )
}
