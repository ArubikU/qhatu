'use client'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

/** Follow/unfollow toggle for a nickname. Fetches current status, optimistic toggle. */
export function FollowButton({ nickname }: { nickname: string }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const qc          = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['following', nickname, accessToken],
    queryFn:  () => api.social.isFollowing(nickname, accessToken ?? ''),
    enabled:  !!accessToken,
    staleTime: 30_000,
  })
  const following = data?.following ?? false

  const toggle = useMutation({
    mutationFn: () => api.social.follow(nickname, following ? 'unfollow' : 'follow', accessToken ?? ''),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['following', nickname] })
      qc.invalidateQueries({ queryKey: ['feed'] })  // following tab may change
    },
  })

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); toggle.mutate() }}
      disabled={isLoading || toggle.isPending}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body transition-colors flex-shrink-0',
        following
          ? 'bg-white/5 border border-white/15 text-white/70 hover:border-red-400/40 hover:text-red-400'
          : 'bg-primary text-white hover:bg-[#6b2fe2]',
      ].join(' ')}
    >
      {toggle.isPending
        ? <Loader2 size={12} className="animate-spin" />
        : following ? <UserCheck size={12} /> : <UserPlus size={12} />}
      {following ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}
