import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  MoreVertical,
  Edit2,
  Zap,
  TrendingUp,
  Trophy,
  MessageCircle,
  FileText,
} from 'lucide-react'
import BottomNav from '../components/layout/BottomNav'
import FeedCard from '../components/feed/FeedCard'
import StatsRow from '../components/profile/StatsRow'
import AchievementBadge from '../components/profile/AchievementBadge'
import { mockUser, mockUserPosts } from '../data/mockData'
import { cn } from '../lib/utils'

type ProfileTab = 'posts' | 'guardados'

const achievements = [
  {
    icon: Zap,
    name: 'Racha 7 dias',
    description: 'Publicaste 7 dias seguidos',
    status: 'unlocked' as const,
  },
  {
    icon: Zap,
    name: 'Racha 30 dias',
    description: 'Publica 30 dias seguidos',
    status: 'progress' as const,
    progress: { current: 12, total: 30 },
  },
  {
    icon: TrendingUp,
    name: 'Post Viral',
    description: '500+ reacciones en un post',
    status: 'locked' as const,
  },
  {
    icon: Trophy,
    name: 'Top Chismoso',
    description: 'N.1 en rankings diarios',
    status: 'unlocked' as const,
  },
  {
    icon: MessageCircle,
    name: 'Comentarista',
    description: 'Deja 100 comentarios',
    status: 'progress' as const,
    progress: { current: 67, total: 100 },
  },
  {
    icon: FileText,
    name: 'Vocero 50',
    description: 'Publicaste 50 posts',
    status: 'unlocked' as const,
  },
]

export default function Profile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-28 md:pb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1
          className="text-white font-semibold text-base"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Perfil
        </h1>
        <button
          onClick={() => {/* settings stub */}}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Opciones"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Hero */}
      <div className="px-4 pt-8 pb-6 flex flex-col items-center gap-4">
        {/* Avatar with animated ring */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-[#7B3FF2]/50 scale-[1.15]"
          />
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7B3FF2] to-[#4B17B6] flex items-center justify-center text-white font-bold text-3xl shadow-[0_0_30px_rgba(123,63,242,0.5)]">
            {mockUser.avatarSeed}
          </div>
        </div>

        <div className="text-center">
          <h2
            className="text-white text-xl font-bold"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {mockUser.nickname}
          </h2>
          <p className="text-white/50 text-sm mt-1">
            {mockUser.faculty} · {mockUser.ageRange}
          </p>
        </div>

        <StatsRow
          posts={mockUser.posts}
          streakDays={mockUser.streakDays}
          totalLikes={mockUser.totalLikes}
        />

        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/70 text-sm hover:bg-white/10 transition-colors">
          <Edit2 size={14} />
          Editar perfil
        </button>
      </div>

      {/* Achievements */}
      <div className="px-4 mb-6">
        <h3
          className="text-white font-semibold text-sm mb-3"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Logros
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((achievement) => (
            <AchievementBadge key={achievement.name} {...achievement} />
          ))}
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 border-b border-white/8 pb-0">
          {(['posts', 'guardados'] as ProfileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 pb-3 text-sm font-medium capitalize border-b-2 transition-all -mb-[2px]',
                activeTab === tab
                  ? 'text-white border-[#7B3FF2]'
                  : 'text-white/40 border-transparent hover:text-white/60'
              )}
            >
              {tab === 'posts' ? 'Mis posts' : 'Guardados'}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="px-4">
        {activeTab === 'posts' ? (
          mockUserPosts.map((post) => (
            <FeedCard key={post.id} post={post} compact />
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 text-white/30">
            <FileText size={36} />
            <p className="text-sm">No tienes posts guardados aun</p>
          </div>
        )}
      </div>

      <BottomNav />
    </motion.div>
  )
}
