'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

type QrState = 'loading' | 'waiting' | 'approved' | 'expired' | 'error'

/**
 * Desktop side of QR login. Creates a short-lived session, renders it as a QR,
 * polls for approval, and rotates (recreates) the session before it expires.
 * On approval it claims tokens and logs the browser in.
 */
export function useQrLogin(enabled: boolean, onSuccess: () => void) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [state, setState]         = useState<QrState>('loading')

  const sessionRef = useRef<string | null>(null)
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const rotateRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const newSession = useCallback(async () => {
    try {
      setState('loading')
      const { sessionId } = await api.auth.qrCreate()
      sessionRef.current = sessionId
      const url = `${window.location.origin}/qr?s=${sessionId}`
      setQrDataUrl(await QRCode.toDataURL(url, {
        margin: 1, width: 240,
        color: { dark: '#0F0D17', light: '#FFFFFF' },
      }))
      setState('waiting')
      // Rotate before the 2-min TTL so the displayed QR refreshes for security
      if (rotateRef.current) clearTimeout(rotateRef.current)
      rotateRef.current = setTimeout(() => { newSession() }, 90_000)
    } catch {
      setState('error')
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    newSession()

    pollRef.current = setInterval(async () => {
      const sid = sessionRef.current
      if (!sid) return
      try {
        const { status } = await api.auth.qrStatus(sid)
        if (status === 'APPROVED') {
          setState('approved')
          const { accessToken, user } = await api.auth.qrClaim(sid)
          setAuth(accessToken, user)
          cleanup()
          onSuccess()
        } else if (status === 'EXPIRED') {
          newSession()  // auto-rotate on expiry
        }
      } catch {
        /* transient — keep polling */
      }
    }, 2000)

    function cleanup() {
      if (pollRef.current) clearInterval(pollRef.current)
      if (rotateRef.current) clearTimeout(rotateRef.current)
    }
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return { qrDataUrl, state, regenerate: newSession }
}
