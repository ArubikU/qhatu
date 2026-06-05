import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-carbon flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <WifiOff size={28} className="text-white/40" />
      </div>
      <h1 className="text-xl font-bold text-white font-heading mb-2">Sin conexión</h1>
      <p className="text-white/50 text-sm font-body max-w-xs">
        No hay internet ahora mismo. Revisa tu conexión — Qhatu volverá apenas vuelvas a estar en línea.
      </p>
    </div>
  )
}
