'use client'
import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-carbon flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-red-400" />
      </div>
      <h1 className="text-xl font-bold text-white font-heading mb-2">Algo salió mal</h1>
      <p className="text-white/50 text-sm font-body mb-6 max-w-xs">Tuvimos un problema cargando esto. Intenta de nuevo.</p>
      <button onClick={reset} className="bg-primary text-white text-sm font-body px-5 py-2.5 rounded-full">
        Reintentar
      </button>
    </div>
  )
}
