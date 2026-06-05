import { motion } from 'framer-motion'
import { ThumbsUp, MessageCircle, TrendingUp, Zap, Trophy } from 'lucide-react'
import BottomNav from '../components/layout/BottomNav'

const mockNotifications = [
  {
    id: '1',
    icon: ThumbsUp,
    text: 'PumaSecreto reaccionó a tu post',
    sub: '"El profe de Cálculo 3..."',
    time: '2 min',
    read: false,
  },
  {
    id: '2',
    icon: MessageCircle,
    text: 'LoboAndino_7 comentó en tu post',
    sub: '"El profe de Cálculo 3..."',
    time: '15 min',
    read: false,
  },
  {
    id: '3',
    icon: TrendingUp,
    text: 'Tu post está en tendencias 🔥',
    sub: 'Llegó a 100+ reacciones',
    time: '1h',
    read: false,
  },
  {
    id: '4',
    icon: Zap,
    text: 'Racha de 12 días activa',
    sub: 'Sigue publicando para mantenerla',
    time: '3h',
    read: true,
  },
  {
    id: '5',
    icon: ThumbsUp,
    text: 'VikingaDelSur y 12 más reaccionaron',
    sub: '"Primera fila del auditorio..."',
    time: '5h',
    read: true,
  },
  {
    id: '6',
    icon: MessageCircle,
    text: 'ZorroFurtivo respondió tu comentario',
    sub: 'En el hilo de la biblioteca',
    time: '8h',
    read: true,
  },
  {
    id: '7',
    icon: Trophy,
    text: '¡Entraste al Top 3 de hoy!',
    sub: '#2 en más likes recibidos',
    time: '23h',
    read: true,
  },
]

export default function Notifications() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-28 md:pb-8"
    >
      {/* Mobile header */}
      <div className="sticky top-0 z-40 bg-[#0F0D17]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 md:hidden">
        <div className="flex items-center justify-between">
          <h1
            className="text-white font-semibold text-base"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Notificaciones
          </h1>
          {unreadCount > 0 && (
            <span className="bg-[#7B3FF2]/20 text-[#C8B6FF] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#7B3FF2]/30">
              {unreadCount} nuevas
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Desktop heading */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <h1
            className="text-white font-bold text-xl"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Notificaciones
          </h1>
          {unreadCount > 0 && (
            <span className="bg-[#7B3FF2]/20 text-[#C8B6FF] text-xs font-medium px-3 py-1 rounded-full border border-[#7B3FF2]/30">
              {unreadCount} nuevas
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {mockNotifications.map(({ id, icon: Icon, text, sub, time, read }) => (
            <div
              key={id}
              className={`flex items-start gap-3 p-4 rounded-2xl transition-colors cursor-pointer ${
                !read
                  ? 'bg-[#7B3FF2]/[0.07] border border-[#7B3FF2]/15 hover:bg-[#7B3FF2]/10'
                  : 'hover:bg-white/5'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  !read ? 'bg-[#7B3FF2]/25' : 'bg-white/5'
                }`}
              >
                <Icon size={16} className={!read ? 'text-[#C8B6FF]' : 'text-white/40'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!read ? 'text-white' : 'text-white/60'}`}>
                  {text}
                </p>
                <p className="text-white/30 text-xs mt-0.5 truncate">{sub}</p>
                <p className="text-white/25 text-xs mt-1">{time}</p>
              </div>
              {!read && (
                <div className="w-2 h-2 rounded-full bg-[#7B3FF2] mt-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </motion.div>
  )
}
