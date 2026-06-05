import { Bell } from 'lucide-react'

export default function TopBar() {
  return (
    <div className="sticky top-0 z-40 bg-[#0F0D17]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between md:hidden">
      {/* Imagotipo: isotipo + logotipo */}
      <div className="flex items-center gap-2">
        <img src="/isotipo.png" alt="Qhatu icon" className="h-8 w-auto" />
        <img src="/logotipo.png" alt="Qhatu" className="h-10 w-auto" />
      </div>

      {/* Notifications */}
      <button className="relative p-1">
        <Bell size={22} className="text-white/70" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
          3
        </span>
      </button>
    </div>
  )
}
