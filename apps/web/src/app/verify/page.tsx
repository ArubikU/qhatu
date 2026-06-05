'use client'
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  type KeyboardEvent,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Mail,
  CheckCircle,
  RefreshCw,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { AuthShell } from '@/components/layout/AuthShell'

const OTP_LENGTH = 6

const FACULTIES = [
  'Ingeniería',
  'Ciencias',
  'Humanidades',
  'Economía',
  'Derecho',
  'Medicina',
  'Arquitectura',
  'Educación',
  'Psicología',
  'Otra',
]

const AGE_RANGES = ['17-18', '19-20', '21-23', '24-26', '27+']

const GENDERS = ['Prefiero no decir', 'Mujer', 'Hombre', 'No binario', 'Otro']

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const visible = local.slice(0, 3)
  return `${visible}***@${domain}`
}

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isLoginMode = searchParams.get('login') === 'true'

  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [countdown, setCountdown] = useState(60)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Profile step (only for new registrations)
  const [showProfile, setShowProfile] = useState(false)
  const [faculty, setFaculty] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [gender, setGender] = useState('')
  const [pendingTokens, setPendingTokens] = useState<{
    accessToken: string
    user: { nickname: string; avatarSeed: string; faculty: string | null }
  } | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const isOtpComplete = otp.every((d) => d !== '')

  // Read pending email from sessionStorage
  useEffect(() => {
    if (isLoginMode) return
    const stored = sessionStorage.getItem('pending_email')
    if (!stored) {
      router.replace('/register')
      return
    }
    setEmail(stored)
  }, [isLoginMode, router])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setErrorMsg(null)
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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const newOtp = [...otp]
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[nextIndex]?.focus()
    setFocusedIndex(nextIndex)
  }

  const activeEmail = isLoginMode ? loginEmail : email

  const handleResend = useCallback(async () => {
    if (!activeEmail || resending) return
    setResending(true)
    setErrorMsg(null)
    try {
      await api.auth.register(activeEmail)
      setCountdown(60)
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
      setFocusedIndex(0)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('No se pudo reenviar el código')
      }
    } finally {
      setResending(false)
    }
  }, [activeEmail, resending])

  const handleVerify = async () => {
    if (!isOtpComplete || loading) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const result = await api.auth.verifyOtp({
        email: activeEmail,
        otp: otp.join(''),
      })
      if (!isLoginMode) {
        // Show optional profile step for new registrations
        setPendingTokens(result)
        setShowProfile(true)
      } else {
        setAuth(result.accessToken, result.user)
        router.replace('/feed')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('Código inválido o expirado')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFinishProfile = async (skip: boolean) => {
    if (!pendingTokens) return
    if (skip || (!faculty && !ageRange && !gender)) {
      setAuth(pendingTokens.accessToken, pendingTokens.user)
      router.replace('/feed')
      return
    }
    // Re-verify with profile data (optional enrichment call — skip if no endpoint)
    setAuth(pendingTokens.accessToken, pendingTokens.user)
    router.replace('/feed')
  }

  // --- Profile step ---
  if (showProfile) {
    return (
      <AuthShell>
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col flex-1 px-6 pt-6 pb-8"
      >
        {/* Step indicator */}
        <div className="flex gap-2 mb-8 mt-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className="h-1.5 rounded-full bg-primary flex-[2] transition-all duration-300"
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-white text-2xl font-bold mb-2 font-heading">
            Cuéntanos un poco
          </h2>
          <p className="text-white/50 text-sm font-body">
            Opcional — para personalizar tu feed
          </p>
        </motion.div>

        <div className="flex flex-col gap-4 mb-auto">
          {/* Faculty */}
          <div className="relative">
            <label className="text-white/50 text-xs mb-1.5 block font-body">
              Facultad
            </label>
            <div className="relative">
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl text-white py-4 px-4 pr-10 text-sm font-body focus:outline-none focus:border-primary transition-colors"
              >
                <option value="" className="bg-carbon">
                  Selecciona tu facultad
                </option>
                {FACULTIES.map((f) => (
                  <option key={f} value={f} className="bg-carbon">
                    {f}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
            </div>
          </div>

          {/* Age range */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block font-body">
              Rango de edad
            </label>
            <div className="flex gap-2 flex-wrap">
              {AGE_RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAgeRange(ageRange === r ? '' : r)}
                  className={`px-4 py-2 rounded-2xl text-sm border transition-all font-body ${
                    ageRange === r
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-primary/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block font-body">
              Género
            </label>
            <div className="flex gap-2 flex-wrap">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(gender === g ? '' : g)}
                  className={`px-4 py-2 rounded-2xl text-sm border transition-all font-body ${
                    gender === g
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-primary/50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <button
            type="button"
            onClick={() => handleFinishProfile(false)}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#6b2fe2] text-white font-semibold py-4 rounded-2xl shadow-[0_0_25px_rgba(123,63,242,0.4)] transition-all duration-200 font-heading"
          >
            <CheckCircle size={18} />
            Guardar y entrar
          </button>
          <button
            type="button"
            onClick={() => handleFinishProfile(true)}
            className="text-white/40 text-sm text-center hover:text-white/60 transition-colors font-body"
          >
            Omitir por ahora
          </button>
        </div>
      </motion.div>
      </AuthShell>
    )
  }

  // --- OTP step (login mode) — show email input too ---
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
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step <= 2 ? 'bg-primary flex-[2]' : 'bg-white/10 flex-1'
            }`}
          />
        ))}
      </div>

      {/* Mail icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-qhatu flex items-center justify-center shadow-[0_0_40px_rgba(123,63,242,0.4)]">
          <Mail size={36} className="text-white" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-white text-2xl font-bold mb-2 font-heading">
          {isLoginMode ? 'Inicia sesión' : 'Revisa tu correo'}
        </h2>
        {isLoginMode ? (
          <p className="text-white/50 text-sm font-body">
            Ingresa tu correo universitario
          </p>
        ) : (
          <p className="text-white/50 text-sm font-body">
            Enviamos un código a{' '}
            <span className="text-white/80">{maskEmail(email)}</span>
          </p>
        )}
      </div>

      {/* Login mode: email input */}
      {isLoginMode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            <Mail size={18} />
          </div>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="tu@universidad.edu.pe"
            autoComplete="email"
            className="w-full bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors py-4 pl-11 pr-4 text-sm font-body"
          />
        </motion.div>
      )}

      {/* OTP Inputs */}
      <div className="flex gap-3 justify-center mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => setFocusedIndex(index)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={[
              'w-12 h-14 text-center text-xl font-bold bg-white/5 border rounded-xl text-white transition-all focus:outline-none font-heading',
              focusedIndex === index && digit === ''
                ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(123,63,242,0.3)]'
                : digit
                ? 'border-primary/60 bg-primary/10'
                : 'border-white/10',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {errorMsg && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-xs text-center mb-4 font-body"
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Countdown / Resend */}
      <div className="flex justify-center mb-8">
        {countdown > 0 ? (
          <span className="text-white/40 text-sm font-body">
            Reenviar código (0:{countdown.toString().padStart(2, '0')})
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-2 text-lavender text-sm font-medium hover:text-white transition-colors font-body disabled:opacity-50"
          >
            {resending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Reenviar código
          </button>
        )}
      </div>

      <div className="flex-1" />

      {/* Verify button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={!isOtpComplete || loading || (isLoginMode && !loginEmail)}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#6b2fe2] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl shadow-[0_0_25px_rgba(123,63,242,0.4)] disabled:shadow-none transition-all duration-200 font-heading"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <CheckCircle size={18} />
            Verificar código
          </>
        )}
      </button>
    </motion.div>
    </AuthShell>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  )
}
