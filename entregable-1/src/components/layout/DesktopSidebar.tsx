import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Search,
  TrendingUp,
  Bell,
  User,
  Bookmark,
  Settings,
  Plus,
  Zap,
  LogOut,
} from 'lucide-react'
import { mockUser } from '../../data/mockData'

const primaryNav = [
  { icon: Home,       label: 'Inicio',         path: '/feed' },
  { icon: Search,     label: 'Búsqueda',        path: '/search' },
  { icon: TrendingUp, label: 'Tendencias',      path: '/feed?tab=trending' },
  { icon: Bell,       label: 'Notificaciones',  path: '/notifications', badge: 3 },
  { icon: User,       label: 'Perfil',          path: '/profile' },
  { icon: Bookmark,   label: 'Guardados',       path: '/saved' },
]

export default function DesktopSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    const basePath = path.split('?')[0]
    return location.pathname === basePath
  }

  return (
    <aside className="hidden md:flex flex-col w-16 lg:w-64 shrink-0 h-screen sticky top-0 border-r border-white/5 py-5 px-2 lg:px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-6 px-2 lg:px-1 h-10">
        <img src="/isotipo.png" alt="Qhatu" className="h-8 w-auto shrink-0" />
        <img src="/logotipo.png" alt="Qhatu" className="hidden lg:block h-8 w-auto" />
      </div>

      {/* Primary navigation */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {primaryNav.map(({ icon: Icon, label, path, badge }) => {
          const active = isActive(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-2xl transition-all duration-150 w-full group ${
                active
                  ? 'bg-[#7B3FF2]/15 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <div className="relative shrink-0">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.2 : 1.8}
                  className={active ? 'text-[#7B3FF2]' : ''}
                />
                {/* Mobile badge (icon-only view) */}
                {badge && !active && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white lg:hidden">
                    {badge}
                  </span>
                )}
              </div>
              <span
                className={`hidden lg:block text-sm flex-1 text-left transition-all ${
                  active ? 'font-semibold' : 'font-medium'
                }`}
              >
                {label}
              </span>
              {/* Desktop badge */}
              {badge && (
                <span className="hidden lg:flex w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold items-center justify-center text-white ml-auto shrink-0">
                  {badge}
                </span>
              )}
            </button>
          )
        })}

        {/* Settings — separated */}
        <div className="border-t border-white/5 mt-2 pt-2">
          <button
            onClick={() => {/* settings stub */}}
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-2xl transition-all duration-150 w-full text-white/40 hover:bg-white/5 hover:text-white/70"
          >
            <Settings size={21} strokeWidth={1.8} className="shrink-0" />
            <span className="hidden lg:block text-sm font-medium">Configuración</span>
          </button>
        </div>
      </nav>

      {/* Create post button */}
      <button
        onClick={() => navigate('/create')}
        className="flex items-center justify-center gap-2 bg-[#7B3FF2] hover:bg-[#6b2fe2] active:scale-95 text-white font-semibold py-3 px-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(123,63,242,0.4)] hover:shadow-[0_0_30px_rgba(123,63,242,0.6)] mb-3"
      >
        <Plus size={20} className="shrink-0" />
        <span className="hidden lg:block text-sm">Crear post</span>
      </button>

      {/* Current user — Twitter-style bottom section */}
      <div className="border-t border-white/5 pt-3">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-white/5 transition-all w-full group"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B3FF2] to-[#4B17B6] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-[0_0_12px_rgba(123,63,242,0.4)]">
            {mockUser.avatarSeed}
          </div>
          <div className="hidden lg:flex flex-col flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-white text-sm font-semibold truncate">{mockUser.nickname}</span>
              {mockUser.streakDays >= 7 && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <Zap size={11} className="text-orange-400" />
                  <span className="text-orange-400 text-[10px] font-bold">{mockUser.streakDays}</span>
                </div>
              )}
            </div>
            <span className="text-white/40 text-xs truncate">{mockUser.faculty}</span>
          </div>
          <LogOut
            size={16}
            className="hidden lg:block text-white/20 group-hover:text-white/50 transition-colors shrink-0 ml-auto"
          />
        </button>
      </div>
    </aside>
  )
}
