'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flame, Star, LogOut, Trophy, Sparkles, Settings, Pencil } from 'lucide-react'
import { AvatarPicker } from '@/components/profile/AvatarPicker'
import { useQuery } from '@tanstack/react-query'
import { getReward, prestigeMaterial } from '@qhatu/shared'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { Avatar } from '@/components/common/Avatar'
import { NameEffect } from '@/components/rewards/NameEffect'

export default function ProfilePage() {
  const router          = useRouter()
  const { isAuthenticated, accessToken, user: storeUser, clearAuth } = useAuthStore()
  const [avatarOpen, setAvatarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/login')
  }, [isAuthenticated, router])

  const { data: profile, isLoading } = useQuery({
    queryKey: ['me', accessToken],
    queryFn:  () => api.users.me(accessToken ?? ''),
    enabled:  !!accessToken,
    staleTime: 60_000,
  })

  const handleLogout = async () => {
    if (accessToken) {
      await api.auth.logout(accessToken).catch(() => null)
    }
    clearAuth()
    router.replace('/login')
  }

  const displayUser = profile ?? (storeUser ? { ...storeUser, streakCount: 0, totalLikesEarned: 0, universityDomain: '', ageRange: null, id: '', createdAt: '' } : null)

  return (
    <div className="min-h-screen bg-carbon pb-24">
      {/* Background glow */}
      <div className="fixed top-0 left-0 right-0 h-56 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />

      <div className="relative px-4 pt-12">
        {/* Header actions — floating liquid-glass bar */}
        <div className="flex justify-center mb-6">
          <div className="liquid-glass rounded-full px-2 py-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => router.push('/rankings')}
              title="Ranking"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/65 hover:text-white hover:bg-white/10 text-xs font-body transition-colors"
            >
              <Trophy size={14} /> <span className="hidden xs:inline">Ranking</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/rewards')}
              title="Recompensas"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/25 text-lavender hover:text-white text-xs font-body transition-colors"
            >
              <Sparkles size={14} /> Recompensas
            </button>
            <button
              type="button"
              onClick={() => router.push('/settings')}
              title="Seguridad"
              className="flex items-center justify-center w-9 h-9 rounded-full text-white/65 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Settings size={15} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="Salir"
              className="flex items-center justify-center w-9 h-9 rounded-full text-white/65 hover:text-red-400 hover:bg-white/10 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Avatar + name (with equipped cosmetics) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          {displayUser && (
            <button
              type="button"
              onClick={() => setAvatarOpen(true)}
              className="mb-4 relative group"
              title="Cambiar avatar"
            >
              <Avatar
                seed={displayUser.avatarSeed ?? displayUser.nickname ?? 'q'}
                size={88}
                frameId={profile?.equipped?.frame}
                imageUrl={profile?.avatarUrl}
              />
              <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary border-2 border-carbon flex items-center justify-center text-white opacity-90 group-hover:scale-110 transition-transform">
                <Pencil size={13} />
              </span>
            </button>
          )}
          <h1 className="text-2xl font-bold mb-1 font-heading">
            <NameEffect effectId={profile?.equipped?.nameEffect}>
              {isLoading ? '...' : (profile?.nickname ?? storeUser?.nickname ?? '')}
            </NameEffect>
          </h1>
          {profile?.equipped?.title && getReward(profile.equipped.title) && (
            <span className="text-xs text-lavender bg-primary/15 border border-primary/30 rounded-full px-3 py-0.5 mb-1 font-body">
              {getReward(profile.equipped.title)!.name}
            </span>
          )}
          {profile?.faculty && (
            <span className="text-sm text-white/50 font-body">{profile.faculty}</span>
          )}
          {profile?.universityDomain && (
            <span className="text-xs text-white/30 font-body mt-0.5">{profile.universityDomain}</span>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <div className="glass rounded-2xl p-4 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Flame size={16} className="text-orange-400" />
              <span className="text-2xl font-bold text-white font-heading">
                {profile?.streakCount ?? 0}
              </span>
            </div>
            <p className="text-xs text-white/40 font-body">días de racha</p>
            {(profile?.prestige ?? 0) > 0 && (
              <span
                className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full font-heading"
                style={{ background: prestigeMaterial(profile!.prestige).color, color: '#0F0D17' }}
              >
                {prestigeMaterial(profile!.prestige).name}
                {profile!.prestige > 1 ? ` ${profile!.prestige}` : ''}
              </span>
            )}
          </div>
          <div className="glass rounded-2xl p-4 border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star size={16} className="text-yellow-400" />
              <span className="text-2xl font-bold text-white font-heading">
                {profile?.totalLikesEarned ?? 0}
              </span>
            </div>
            <p className="text-xs text-white/40 font-body">likes recibidos</p>
          </div>
        </motion.div>

        {/* Info card */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-4 border border-white/5 mb-4"
          >
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 font-body">Perfil</h3>
            <div className="flex flex-col gap-2">
              {profile.faculty && (
                <Row label="Facultad" value={profile.faculty} />
              )}
              {profile.ageRange && (
                <Row label="Rango de edad" value={profile.ageRange} />
              )}
              <Row label="Universidad" value={profile.universityDomain} />
              <Row
                label="Miembro desde"
                value={profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
                  : '—'}
              />
            </div>
          </motion.div>
        )}
      </div>

      <AvatarPicker
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        currentSeed={profile?.avatarSeed ?? storeUser?.avatarSeed ?? 'q'}
        frameId={profile?.equipped?.frame}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/40 font-body">{label}</span>
      <span className="text-sm text-white/80 font-body">{value}</span>
    </div>
  )
}
