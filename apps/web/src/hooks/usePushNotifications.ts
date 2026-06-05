'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

type PushStatus = 'unsupported' | 'default' | 'granted' | 'denied' | 'subscribed'

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64     = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(b64)
  const arr     = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export function usePushNotifications() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const [status, setStatus] = useState<PushStatus>('default')
  const [busy, setBusy]     = useState(false)

  const supported = typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window

  useEffect(() => {
    if (!supported) { setStatus('unsupported'); return }
    setStatus(Notification.permission as PushStatus)

    // Check if already subscribed
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.pushManager.getSubscription().then((sub) => {
        if (sub) setStatus('subscribed')
      })
    })
  }, [supported])

  const subscribe = useCallback(async () => {
    if (!supported || !accessToken || busy) return
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      const { publicKey } = await api.notifications.vapidKey()
      if (!publicKey) { setStatus('default'); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // Cast: lib.dom types want a strict ArrayBuffer view; runtime accepts Uint8Array
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      })

      await api.notifications.subscribe(sub.toJSON() as PushSubscriptionJSON, accessToken)
      setStatus('subscribed')
    } catch (err) {
      console.error('[push] subscribe failed', err)
      setStatus('default')
    } finally {
      setBusy(false)
    }
  }, [supported, accessToken, busy])

  return { status, supported, busy, subscribe }
}
