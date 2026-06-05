'use client'
import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Registers the service worker (offline + push) and surfaces an install prompt.
 * Mount once near the app root.
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow]         = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      // Don't nag: only if not dismissed before
      if (localStorage.getItem('qhatu-install-dismissed') !== '1') setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null); setShow(false)
  }

  const dismiss = () => {
    localStorage.setItem('qhatu-install-dismissed', '1')
    setShow(false)
  }

  return (
    <>
      {children}
      {show && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="glass rounded-2xl border border-primary/30 p-3 flex items-center gap-3 shadow-[0_8px_32px_rgba(123,63,242,0.3)]">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Download size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white font-heading">Instala Qhatu</p>
              <p className="text-xs text-white/50 font-body">Acceso rápido, como una app.</p>
            </div>
            <button onClick={install} className="text-xs bg-primary text-white px-3 py-1.5 rounded-full font-body whitespace-nowrap">Instalar</button>
            <button onClick={dismiss} className="text-white/40 hover:text-white"><X size={16} /></button>
          </div>
        </div>
      )}
    </>
  )
}
