import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, AtSign, Check, X, ArrowRight, Lock } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const isValid = email.includes('@') && email.includes('.') && email.length > 5
  const hasAt = email.includes('@')

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="min-h-screen flex flex-col px-6 pt-4 pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1
          className="text-white font-semibold text-base"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Crear cuenta
        </h1>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 1 ? 'bg-[#7B3FF2] flex-[2]' : 'bg-white/10 flex-1'
            }`}
          />
        ))}
      </div>

      {/* Title */}
      <div className="mb-8">
        <h2
          className="text-white text-2xl font-bold mb-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Cual es tu correo?
        </h2>
        <p className="text-white/50 text-sm">
          Solo correos universitarios permitidos
        </p>
      </div>

      {/* Email Input */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
          <AtSign size={18} />
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@universidad.edu.pe"
          className="w-full bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[#7B3FF2] transition-colors py-4 pl-11 pr-12 text-sm"
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

      {/* Anonymity badge */}
      <div className="flex items-center gap-2 bg-[#7B3FF2]/10 border border-[#7B3FF2]/30 rounded-2xl py-3 px-4 mb-8">
        <Lock size={14} className="text-[#7B3FF2] shrink-0" />
        <span className="text-white/70 text-xs">Tu identidad siempre sera anonima</span>
      </div>

      <div className="flex-1" />

      {/* Continue button */}
      <button
        onClick={() => navigate('/verify')}
        disabled={!isValid}
        className="w-full flex items-center justify-center gap-2 bg-[#7B3FF2] hover:bg-[#6b2fe2] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-[0_0_25px_rgba(123,63,242,0.4)] disabled:shadow-none transition-all duration-200 mb-4"
      >
        Continuar
        <ArrowRight size={18} />
      </button>

      <button
        onClick={() => navigate('/')}
        className="text-white/40 text-sm text-center hover:text-white/60 transition-colors"
      >
        Ya tengo cuenta.{' '}
        <span className="text-[#C8B6FF]">Inicia sesión</span>
      </button>
    </motion.div>
  )
}
