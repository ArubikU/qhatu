'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Monitor, ShieldCheck, ShieldAlert, Loader2, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/lib/api'

function QrApproveContent() {
  const router      = useRouter()
  const params      = useSearchParams()
  const sessionId   = params.get('s') ?? ''
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuth      = useAuthStore((s) => s.isAuthenticated)

  const [phase, setPhase] = useState<'confirm' | 'approving' | 'done' | 'error'>('confirm')
  const [error, setError] = useState<string | null>(null)

  // Must be logged in on this device to approve
  if (!isAuth()) {
    if (typeof window !== 'undefined') router.replace(`/login`)
    return null
  }

  const approve = async () => {
    if (!sessionId || !accessToken) return
    setPhase('approving')
    try {
      await api.auth.qrApprove(sessionId, accessToken)
      setPhase('done')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo aprobar')
      setPhase('error')
    }
  }

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 border border-white/10 max-w-sm w-full text-center"
      >
        {phase === 'done' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={30} className="text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-white font-heading mb-2">¡Listo!</h1>
            <p className="text-white/50 text-sm font-body">Inicia sesión en el otro dispositivo. Ya puedes cerrar esto.</p>
          </>
        ) : phase === 'error' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={30} className="text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white font-heading mb-2">No se pudo aprobar</h1>
            <p className="text-red-400 text-sm font-body">{error}</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Monitor size={30} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-white font-heading mb-2">¿Iniciar sesión?</h1>
            <p className="text-white/50 text-sm font-body mb-6">
              Otro dispositivo quiere entrar a tu cuenta con este código QR. Aprueba solo si fuiste tú.
            </p>
            <button
              type="button"
              onClick={approve}
              disabled={phase === 'approving' || !sessionId}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#6b2fe2] disabled:bg-white/10 text-white font-semibold py-3.5 rounded-2xl shadow-[0_0_25px_rgba(123,63,242,0.4)] transition-all font-heading mb-3"
            >
              {phase === 'approving' ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              Sí, soy yo — aprobar
            </button>
            <button type="button" onClick={() => router.replace('/feed')} className="text-white/40 text-sm font-body hover:text-white/70">
              No fui yo
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function QrApprovePage() {
  return (
    <Suspense fallback={null}>
      <QrApproveContent />
    </Suspense>
  )
}
