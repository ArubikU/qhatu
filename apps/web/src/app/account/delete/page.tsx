'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trash2, Loader2, CheckCircle, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/lib/api'

function DeleteConfirmContent() {
  const router    = useRouter()
  const token     = useSearchParams().get('t') ?? ''
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const [phase, setPhase] = useState<'confirm' | 'busy' | 'done' | 'error'>('confirm')
  const [err, setErr]     = useState<string | null>(null)

  const confirm = async () => {
    if (!token) { setErr('Enlace inválido.'); setPhase('error'); return }
    setPhase('busy')
    try {
      await api.auth.deleteConfirm(token)
      clearAuth()
      setPhase('done')
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'No se pudo eliminar la cuenta')
      setPhase('error')
    }
  }

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-3xl p-8 border border-white/10 max-w-sm w-full text-center">
        {phase === 'done' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4"><CheckCircle size={30} className="text-white/60" /></div>
            <h1 className="text-xl font-bold text-white font-heading mb-2">Cuenta eliminada</h1>
            <p className="text-white/50 text-sm font-body mb-4">Tu identidad y datos fueron borrados. Gracias por pasar por Qhatu.</p>
            <button onClick={() => router.replace('/login')} className="text-lavender text-sm font-body">Ir al inicio</button>
          </>
        ) : phase === 'error' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4"><ShieldAlert size={30} className="text-red-400" /></div>
            <h1 className="text-xl font-bold text-white font-heading mb-2">Error</h1>
            <p className="text-red-400 text-sm font-body">{err}</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4"><Trash2 size={30} className="text-red-400" /></div>
            <h1 className="text-xl font-bold text-white font-heading mb-2">¿Eliminar tu cuenta?</h1>
            <p className="text-white/50 text-sm font-body mb-6">Esto borra todo tu historial de forma permanente. No se puede deshacer.</p>
            <button onClick={confirm} disabled={phase === 'busy'} className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl transition-all font-heading mb-3">
              {phase === 'busy' ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              Sí, eliminar definitivamente
            </button>
            <button onClick={() => router.replace('/feed')} className="text-white/40 text-sm font-body hover:text-white/70">Cancelar</button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function AccountDeletePage() {
  return <Suspense fallback={null}><DeleteConfirmContent /></Suspense>
}
