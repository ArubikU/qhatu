'use client'
import { useUIStore } from '@/store/uiStore'

/**
 * Componente invisible que se re-renderiza cuando bumpNav() incrementa navTick.
 * Ese re-render síncrono (Zustand) descarga la transición de navegación del App
 * Router que de otro modo queda pendiente sin commitear. Ver lib/nav.ts.
 */
export function NavFlush() {
  useUIStore((s) => s.navTick)
  return null
}
