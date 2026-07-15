'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, AtSign, ShieldQuestion, ArrowRight, Loader2, KeyRound } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { AuthShell } from '@/components/layout/AuthShell'

export default function RecoverPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [step, setStep]       = useState<'email' | 'otp'>('email')
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [info, setInfo]       = useState<string | null>(null)

  const emailValid = email.includes('@') && email.includes('.edu') && email.length > 8
  const otpValid   = /^\d{6}$/.test(otp)

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailValid || loading) return
    setLoading(true); setError(null); setInfo(null)
    try {
      const res = await api.auth.recoverRequest(email)
      setInfo(res.message)
      setStep('otp')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor')
    } finally { setLoading(false) }
  }

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpValid || loading) return
    setLoading(true); setError(null)
    try {
      const { accessToken, user } = await api.auth.recoverConfirm(email, otp)
      setAuth(accessToken, user)
      router.replace('/feed')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo recuperar la cuenta')
    } finally { setLoading(false) }
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col flex-1 px-6 pt-6 pb-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => (step === 'otp' ? setStep('email') : router.push('/login'))}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-white font-semibold text-base font-heading">Recuperar cuenta</h1>
        </div>

        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-primary/40 blur-2xl scale-110" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-deep flex items-center justify-center">
              {step === 'email' ? <ShieldQuestion size={32} className="text-white" /> : <KeyRound size={32} className="text-white" />}
            </div>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2 font-heading text-center">
            {step === 'email' ? 'Perdí mi cuenta' : 'Ingresa el código'}
          </h2>
          <p className="text-white/50 text-sm font-body text-center max-w-[280px]">
            {step === 'email'
              ? 'Te enviaremos un código a tu correo. Al validarlo, tu cuenta se reinicia con una identidad nueva — tus posts se conservan.'
              : `Enviamos un código de 6 dígitos a ${email}.`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={sendCode} className="flex flex-col flex-1">
            <div className="relative mb-3">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"><AtSign size={18} /></div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                placeholder="tu@universidad.edu.pe"
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors py-4 pl-11 pr-4 text-sm font-body"
              />
            </div>
            {error && <p className="text-red-400 text-xs mb-3 px-1 font-body">{error}</p>}
            <div className="flex-1" />
            <button
              type="submit"
              disabled={!emailValid || loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#6b2fe2] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-[0_0_25px_rgba(123,63,242,0.4)] disabled:shadow-none transition-all duration-200 font-heading"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" />Enviando...</> : <>Enviar código<ArrowRight size={18} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={confirm} className="flex flex-col flex-1">
            <input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(null) }}
              placeholder="••••••"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl text-white text-center tracking-[0.5em] text-xl placeholder-white/20 focus:outline-none focus:border-primary transition-colors py-4 mb-3 font-body"
            />
            {info && !error && <p className="text-white/40 text-xs mb-2 px-1 font-body">{info}</p>}
            {error && <p className="text-red-400 text-xs mb-3 px-1 font-body">{error}</p>}
            <button
              type="button"
              onClick={() => sendCode(new Event('submit') as unknown as React.FormEvent)}
              disabled={loading}
              className="text-lavender text-sm font-body mb-4 hover:text-white transition-colors self-start"
            >
              Reenviar código
            </button>
            <div className="flex-1" />
            <button
              type="submit"
              disabled={!otpValid || loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#6b2fe2] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-[0_0_25px_rgba(123,63,242,0.4)] disabled:shadow-none transition-all duration-200 font-heading"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" />Recuperando...</> : <>Recuperar cuenta<ArrowRight size={18} /></>}
            </button>
          </form>
        )}
      </motion.div>
    </AuthShell>
  )
}
