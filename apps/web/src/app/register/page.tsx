'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, AtSign, Check, X, ArrowRight, Lock, Loader2 } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { AuthShell } from '@/components/layout/AuthShell'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const hasAt = email.includes('@')
  const isValid =
    hasAt &&
    email.includes('.edu') &&
    email.split('@')[0].length > 0 &&
    email.length > 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || loading) return
    setLoading(true)
    setErrorMsg(null)
    try {
      await api.auth.register(email)
      sessionStorage.setItem('pending_email', email)
      router.push('/verify')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('No se pudo conectar al servidor')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex flex-col flex-1 px-6 pt-6 pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-white font-semibold text-base font-heading">
          Crear cuenta
        </h1>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 1 ? 'bg-primary flex-[2]' : 'bg-white/10 flex-1'
            }`}
          />
        ))}
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-white text-2xl font-bold mb-2 font-heading">
          ¿Cuál es tu correo?
        </h2>
        <p className="text-white/50 text-sm font-body">
          Solo correos universitarios permitidos
        </p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        {/* Email Input */}
        <div className="relative mb-3">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <AtSign size={18} />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrorMsg(null)
            }}
            placeholder="tu@universidad.edu.pe"
            autoComplete="email"
            className="w-full bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors py-4 pl-11 pr-12 text-sm font-body"
          />
          {email.length > 0 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isValid ? (
                <Check size={18} className="text-green-400" />
              ) : (
                <X size={18} className="text-red-400" />
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs mb-4 px-1 font-body"
          >
            {errorMsg}
          </motion.p>
        )}

        {/* Anonymity badge */}
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-2xl py-3 px-4 mb-8 mt-3">
          <Lock size={14} className="text-primary shrink-0" />
          <span className="text-white/70 text-xs font-body">
            Tu identidad siempre será anónima
          </span>
        </div>

        <div className="flex-1" />

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#6b2fe2] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-[0_0_25px_rgba(123,63,242,0.4)] disabled:shadow-none transition-all duration-200 mb-4 font-heading"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              Continuar
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push('/verify?login=true')}
          className="text-white/40 text-sm text-center hover:text-white/60 transition-colors font-body"
        >
          Ya tengo cuenta.{' '}
          <span className="text-lavender">Inicia sesión</span>
        </button>
      </form>
    </motion.div>
    </AuthShell>
  )
}
