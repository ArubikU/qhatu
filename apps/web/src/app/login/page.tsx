'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Shield, QrCode, Loader2, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useQrLogin } from '@/hooks/useQrLogin'

export default function LoginPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [qrMode, setQrMode] = useState(false)

  const qr = useQrLogin(qrMode, () => router.replace('/feed'))

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/feed')
    }
  }, [isAuthenticated, router])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-carbon"
    >
      {/* Background blobs */}
      <div className="absolute top-[-80px] left-[-60px] w-64 h-64 rounded-full bg-[#7B3FF2]/20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-40px] w-80 h-80 rounded-full bg-[#4B17B6]/25 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full bg-[#7B3FF2]/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[350px] flex flex-col items-center gap-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-[#7B3FF2]/40 blur-2xl scale-110" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/isotipo.png"
              alt="Qhatu isotipo"
              className="relative w-24 h-24 object-contain drop-shadow-[0_0_30px_rgba(123,63,242,0.8)]"
            />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logotipo.png" alt="Qhatu" className="h-28 w-auto -mt-3 -mb-6" />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-white/50 text-sm text-center leading-relaxed font-body"
        >
          La red social anónima de tu universidad
        </motion.p>

        <AnimatePresence mode="wait">
          {qrMode ? (
            /* ── QR login panel ── */
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full flex flex-col items-center gap-4"
            >
              <div className="bg-white rounded-2xl p-3 w-[240px] h-[240px] flex items-center justify-center">
                {qr.qrDataUrl && qr.state !== 'loading' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr.qrDataUrl} alt="QR de inicio de sesión" width={216} height={216} />
                ) : (
                  <Loader2 size={28} className="animate-spin text-primary" />
                )}
              </div>
              <p className="text-white/60 text-sm text-center font-body max-w-[260px]">
                {qr.state === 'approved'
                  ? 'Aprobado — entrando…'
                  : 'Escanea con tu teléfono ya conectado a Qhatu. El código se renueva solo cada minuto.'}
              </p>
              <button
                type="button"
                onClick={() => setQrMode(false)}
                className="flex items-center gap-1 text-white/40 text-sm hover:text-white/70 font-body"
              >
                <ChevronLeft size={16} /> Volver
              </button>
            </motion.div>
          ) : (
            /* ── Default CTAs ── */
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full flex flex-col gap-4"
            >
              <button
                onClick={() => router.push('/register')}
                className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-[#6b2fe2] text-white font-semibold py-4 rounded-2xl shadow-glow-purple hover:shadow-[0_0_35px_rgba(123,63,242,0.7)] transition-all duration-200 text-base font-heading"
              >
                <Mail size={20} />
                Entrar con correo universitario
              </button>

              <button
                onClick={() => setQrMode(true)}
                className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-primary/50 text-white/80 hover:text-white font-semibold py-4 rounded-2xl transition-all duration-200 text-base font-heading"
              >
                <QrCode size={20} />
                Entrar con código QR
              </button>

              {/* Anonymity badge */}
              <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-2.5 px-4">
                <Shield size={14} className="text-primary" />
                <span className="text-white/60 text-xs font-body">100% anónimo</span>
              </div>

              <button
                type="button"
                onClick={() => router.push('/verify?login=true')}
                className="text-white/40 text-sm hover:text-white/70 transition-colors font-body text-center"
              >
                Ya tengo cuenta.{' '}
                <span className="text-lavender font-medium">Inicia sesión</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
