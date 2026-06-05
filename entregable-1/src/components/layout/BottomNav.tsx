import { useNavigate, useLocation } from 'react-router-dom'
import { Home, TrendingUp, Plus, Bell, User } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { icon: Home, label: 'Inicio', path: '/feed' },
  { icon: TrendingUp, label: 'Tendencias', path: '/feed?tab=trending' },
  { icon: null, label: 'Crear', path: '/create' }, // FAB
  { icon: Bell, label: 'Notificaciones', path: '/notifications' },
  { icon: User, label: 'Perfil', path: '/profile' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    const basePath = path.split('?')[0]
    return location.pathname === basePath
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 px-4 pb-4 md:hidden">
      <div className="bg-[#1A1625]/90 backdrop-blur-xl border border-white/10 rounded-3xl px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          if (!item.icon) {
            // FAB
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7B3FF2] to-[#4B17B6] flex items-center justify-center shadow-[0_0_25px_rgba(123,63,242,0.6)] -mt-5 border-2 border-[#0F0D17]"
              >
                <Plus size={24} className="text-white" />
              </button>
            )
          }
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 px-3 py-1 relative"
            >
              <Icon
                size={22}
                className={active ? 'text-[#7B3FF2]' : 'text-white/40'}
              />
              {active && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#7B3FF2]"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
