'use client'

/**
 * Responsive shell for auth flows (register / verify / login-otp).
 *  - mobile  (<md): full-bleed, single column (native app feel)
 *  - tablet  (md) : centered glass card, max 440px
 *  - desktop (lg+): split — brand panel left, form card right
 *
 * Page content should be a flex-col with its own padding; AuthShell owns the
 * background, centering and the desktop brand side.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-carbon">
      {/* ── Brand panel (desktop only) ── */}
      <aside className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c1138] via-[#150d28] to-[#0F0D17]" />
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-[#7B3FF2]/25 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full bg-[#4B17B6]/30 blur-[130px]" />
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-3xl bg-[#7B3FF2]/40 blur-2xl scale-110" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/isotipo.png" alt="Qhatu" className="relative w-28 h-28 object-contain drop-shadow-[0_0_40px_rgba(123,63,242,0.7)]" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logotipo.png" alt="Qhatu" className="h-10 w-auto mb-3" />
          <p className="text-lavender text-base font-medium font-body mb-2">Tu mundo. Tus chismes.</p>
          <p className="text-white/40 text-sm font-body">La red social anónima de tu universidad</p>
        </div>
      </aside>

      {/* ── Form column ── */}
      <main className="flex-1 flex items-stretch md:items-center justify-center md:p-8">
        <div className="w-full flex flex-col md:max-w-[440px] md:min-h-[560px] md:bg-white/[0.02] md:border md:border-white/10 md:rounded-3xl md:shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}
