'use client'
import { useCallback, useRef } from 'react'
import { EMBEDDING_DIM } from '@qhatu/shared'

interface PendingMap {
  [id: number]: { resolve: (v: number[] | null) => void; timer: ReturnType<typeof setTimeout> }
}

// Module-level singletons so the model loads once across the app
let worker: Worker | null = null
let nextId = 1
const pending: PendingMap = {}

function ensureWorker(): Worker | null {
  if (typeof window === 'undefined') return null
  if (worker) return worker
  try {
    worker = new Worker(new URL('../workers/embed.worker.ts', import.meta.url))
    worker.onmessage = (e: MessageEvent<{ id: number; ok: boolean; vector?: number[] }>) => {
      const { id, ok, vector } = e.data
      const entry = pending[id]
      if (!entry) return
      clearTimeout(entry.timer)
      delete pending[id]
      entry.resolve(ok && vector?.length === EMBEDDING_DIM ? vector : null)
    }
    worker.onerror = () => {
      // Fail all pending → null (post proceeds without embedding)
      for (const id of Object.keys(pending)) {
        const entry = pending[Number(id)]!
        clearTimeout(entry.timer)
        entry.resolve(null)
        delete pending[Number(id)]
      }
    }
  } catch {
    worker = null
  }
  return worker
}

export function useEmbedder() {
  const warmRef = useRef(false)

  /** Kick off model load early (e.g. when composer opens) so first embed is fast. */
  const warmup = useCallback(() => {
    if (warmRef.current) return
    warmRef.current = true
    const w = ensureWorker()
    if (w) w.postMessage({ id: -1, text: 'warmup' }) // ignored result (id -1 not tracked)
  }, [])

  /**
   * Compute a 384-dim embedding for `text`. Resolves null if the worker is
   * unavailable or doesn't finish within `timeoutMs` — caller posts without it.
   */
  const embed = useCallback((text: string, timeoutMs = 8000): Promise<number[] | null> => {
    const clean = text.trim()
    if (!clean) return Promise.resolve(null)
    const w = ensureWorker()
    if (!w) return Promise.resolve(null)

    return new Promise<number[] | null>((resolve) => {
      const id = nextId++
      const timer = setTimeout(() => {
        if (pending[id]) { delete pending[id]; resolve(null) }
      }, timeoutMs)
      pending[id] = { resolve, timer }
      w.postMessage({ id, text: clean })
    })
  }, [])

  return { embed, warmup }
}
