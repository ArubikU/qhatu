'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Mail, Trash2, Loader2, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/lib/api'

export default function SettingsPage() {
  const router          = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const accessToken     = useAuthStore((s) => s.accessToken)

  useEffect(() => { if (!isAuthenticated()) router.replace('/login') }, [isAuthenticated, router])

  // Email change
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp]           = useState('')
  const [emailPhase, setEmailPhase] = useState<'idle' | 'sent' | 'done'>('idle')
  const [emailMsg, setEmailMsg] = useState<string | null>(null)
  const [emailBusy, setEmailBusy] = useState(false)

  // Delete
  const [delEmail, setDelEmail] = useState('')
  const [delMsg, setDelMsg]     = useState<string | null>(null)
  const [delBusy, setDelBusy]   = useState(false)
  const [delOpen, setDelOpen]   = useState(false)

  const requestEmailChange = async () => {
    if (!newEmail || !accessToken) return
    setEmailBusy(true); setEmailMsg(null)
    try {
      await api.auth.changeEmailRequest(newEmail, accessToken)
      setEmailPhase('sent')
    } catch (e) { setEmailMsg(e instanceof ApiError ? e.message : 'Error') }
    finally { setEmailBusy(false) }
  }

  const confirmEmailChange = async () => {
    if (!otp || !accessToken) return
    setEmailBusy(true); setEmailMsg(null)
    try {
      await api.auth.changeEmailConfirm(newEmail, otp, accessToken)
      setEmailPhase('done')
    } catch (e) { setEmailMsg(e instanceof ApiError ? e.message : 'Error') }
    finally { setEmailBusy(false) }
  }

  const requestDelete = async () => {
    if (!delEmail || !accessToken) return
    setDelBusy(true); setDelMsg(null)
    try {
      await api.auth.deleteRequest(delEmail, accessToken)
      setDelMsg('Revisa tu correo para confirmar la eliminación.')
    } catch (e) { setDelMsg(e instanceof ApiError ? e.message : 'Error') }
    finally { setDelBusy(false) }
  }

  return (
    <div className="min-h-screen bg-carbon pb-24">
      <div className="sticky top-0 bg-carbon/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 z-20 flex items-center gap-2">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white"><ChevronLeft size={20} /></button>
        <h1 className="text-xl font-bold text-white font-heading">Seguridad</h1>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4 max-w-md mx-auto">
        {/* Change email */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Mail size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-white font-heading">Cambiar correo</h2>
          </div>
          {emailPhase === 'done' ? (
            <p className="text-green-400 text-sm font-body flex items-center gap-2"><ShieldCheck size={15} /> Correo actualizado.</p>
          ) : emailPhase === 'sent' ? (
            <>
              <p className="text-white/50 text-xs font-body mb-2">Ingresa el código que enviamos a {newEmail}</p>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Código de 6 dígitos" maxLength={6}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-primary mb-2" />
              <button onClick={confirmEmailChange} disabled={emailBusy} className="w-full bg-primary text-white text-sm py-2.5 rounded-xl font-body disabled:opacity-50 flex items-center justify-center gap-2">
                {emailBusy && <Loader2 size={14} className="animate-spin" />} Confirmar
              </button>
            </>
          ) : (
            <>
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" placeholder="nuevo@universidad.edu.pe"
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-primary mb-2" />
              <button onClick={requestEmailChange} disabled={emailBusy || !newEmail} className="w-full bg-primary text-white text-sm py-2.5 rounded-xl font-body disabled:opacity-50 flex items-center justify-center gap-2">
                {emailBusy && <Loader2 size={14} className="animate-spin" />} Enviar código
              </button>
            </>
          )}
          {emailMsg && <p className="text-red-400 text-xs font-body mt-2">{emailMsg}</p>}
        </motion.div>

        {/* Delete account */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-4 border border-red-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 size={16} className="text-red-400" />
            <h2 className="text-sm font-semibold text-white font-heading">Eliminar cuenta</h2>
          </div>
          <p className="text-white/50 text-xs font-body mb-3">Borra tu identidad anónima, posts y todo tu historial. No se puede deshacer.</p>
          {!delOpen ? (
            <button onClick={() => setDelOpen(true)} className="w-full bg-red-500/15 border border-red-500/30 text-red-400 text-sm py-2.5 rounded-xl font-body">
              Quiero eliminar mi cuenta
            </button>
          ) : (
            <>
              <p className="text-white/50 text-xs font-body mb-2">Confirma tu correo para recibir el enlace:</p>
              <input value={delEmail} onChange={(e) => setDelEmail(e.target.value)} type="email" placeholder="tu@universidad.edu.pe"
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-red-500/50 mb-2" />
              <button onClick={requestDelete} disabled={delBusy || !delEmail} className="w-full bg-red-500 text-white text-sm py-2.5 rounded-xl font-body disabled:opacity-50 flex items-center justify-center gap-2">
                {delBusy && <Loader2 size={14} className="animate-spin" />} Enviar enlace de confirmación
              </button>
            </>
          )}
          {delMsg && <p className="text-white/60 text-xs font-body mt-2">{delMsg}</p>}
        </motion.div>
      </div>
    </div>
  )
}
