import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Shield } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute top-[-80px] left-[-60px] w-64 h-64 rounded-full bg-[#7B3FF2]/20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-40px] w-80 h-80 rounded-full bg-[#4B17B6]/25 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full bg-[#7B3FF2]/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[350px] flex flex-col items-center gap-8">
        {/* Logo — isotipo con glow + logotipo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-[#7B3FF2]/40 blur-2xl scale-110" />
            <img
              src="/isomobile_transparent.png"
              alt="Qhatu"
              className="relative w-24 h-24 object-contain drop-shadow-[0_0_30px_rgba(123,63,242,0.8)]"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <img src="/logotipo.png" alt="Qhatu" className="h-8 w-auto" />
            <p className="text-[#C8B6FF] text-base font-medium">
              Tu mundo. Tus chismes.
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/50 text-sm text-center leading-relaxed">
          La red social anónima de tu universidad
        </p>

        {/* CTA Button */}
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={() => navigate('/register')}
            className="w-full flex items-center justify-center gap-3 bg-[#7B3FF2] hover:bg-[#6b2fe2] text-white font-semibold py-4 rounded-2xl shadow-[0_0_25px_rgba(123,63,242,0.5)] hover:shadow-[0_0_35px_rgba(123,63,242,0.7)] transition-all duration-200 text-base"
          >
            <Mail size={20} />
            Entrar con correo universitario
          </button>

          {/* Badge */}
          <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-2.5 px-4">
            <Shield size={14} className="text-[#7B3FF2]" />
            <span className="text-white/60 text-xs">100% anónimo</span>
          </div>
        </div>

        {/* Login link */}
        <button
          onClick={() => navigate('/verify', { state: { fromLogin: true } })}
          className="text-white/40 text-sm hover:text-white/70 transition-colors"
        >
          Ya tengo cuenta.{' '}
          <span className="text-[#C8B6FF] font-medium">Inicia sesión</span>
        </button>
      </div>
    </motion.div>
  )
}
