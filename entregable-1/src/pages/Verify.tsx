import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'

const OTP_LENGTH = 6

export default function Verify() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const isComplete = otp.every((d) => d !== '')

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
      setFocusedIndex(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setFocusedIndex(index - 1)
    }
  }

  const handleResend = () => {
    setCountdown(60)
    setOtp(Array(OTP_LENGTH).fill(''))
    inputRefs.current[0]?.focus()
  }

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
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step <= 2 ? 'bg-[#7B3FF2] flex-[2]' : 'bg-white/10 flex-1'
            }`}
          />
        ))}
      </div>

      {/* Mail icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7B3FF2] to-[#4B17B6] flex items-center justify-center shadow-[0_0_40px_rgba(123,63,242,0.4)]">
          <Mail size={36} className="text-white" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2
          className="text-white text-2xl font-bold mb-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Revisa tu correo
        </h2>
        <p className="text-white/50 text-sm">
          Enviamos un codigo a{' '}
          <span className="text-white/80">tu***@uni.edu.pe</span>
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex gap-3 justify-center mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => setFocusedIndex(index)}
            className={cn(
              'w-12 h-14 text-center text-xl font-bold bg-white/5 border rounded-xl text-white transition-all focus:outline-none',
              focusedIndex === index && digit === ''
                ? 'border-[#7B3FF2] bg-[#7B3FF2]/10 shadow-[0_0_15px_rgba(123,63,242,0.3)]'
                : digit
                ? 'border-[#7B3FF2]/60 bg-[#7B3FF2]/10'
                : 'border-white/10'
            )}
          />
        ))}
      </div>

      {/* Countdown / Resend */}
      <div className="flex justify-center mb-8">
        {countdown > 0 ? (
          <span className="text-white/40 text-sm">
            Reenviar codigo (0:{countdown.toString().padStart(2, '0')})
          </span>
        ) : (
          <button
            onClick={handleResend}
            className="flex items-center gap-2 text-[#C8B6FF] text-sm font-medium hover:text-white transition-colors"
          >
            <RefreshCw size={14} />
            Reenviar codigo
          </button>
        )}
      </div>

      <div className="flex-1" />

      {/* Verify button */}
      <button
        onClick={() => navigate('/feed')}
        disabled={!isComplete}
        className="w-full flex items-center justify-center gap-2 bg-[#7B3FF2] hover:bg-[#6b2fe2] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-[0_0_25px_rgba(123,63,242,0.4)] disabled:shadow-none transition-all duration-200"
      >
        <CheckCircle size={18} />
        Verificar codigo
      </button>
    </motion.div>
  )
}
