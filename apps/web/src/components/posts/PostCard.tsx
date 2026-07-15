'use client'
import { useState, memo } from 'react'
import { MessageCircle, Trash2, Clock, Eye, Share2, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/common/Avatar'
import { NameEffect } from '@/components/rewards/NameEffect'
import { getReward } from '@qhatu/shared'
import { ReactionBar } from '@/components/posts/ReactionBar'
import { CommentSection } from '@/components/posts/CommentSection'
import { useToggleReaction } from '@/hooks/useFeed'
import { useAuthStore } from '@/store/authStore'
import { useDeny } from '@/components/ui/ConfirmHost'
import { RichText } from '@/components/ui/RichText'
import { api } from '@/lib/api'
import type { PostItem, ReactionType } from '@/lib/api'
import { formatDistanceToNow } from '@/lib/timeFormat'
import { useQueryClient } from '@tanstack/react-query'

interface PostCardProps {
  post: PostItem
  defaultCommentsOpen?: boolean
}

function PostCardBase({ post, defaultCommentsOpen = false }: PostCardProps) {
  const [showComments, setShowComments]   = useState(defaultCommentsOpen)
  const [shared, setShared]               = useState(false)
  const { mutate: toggleReaction, isPending } = useToggleReaction(post.id)
  const accessToken = useAuthStore((s) => s.accessToken)
  const qc          = useQueryClient()
  const deny        = useDeny()

  const expiresIn = post.expiresAt ? hoursLeft(post.expiresAt) : null

  const handleReact = (type: ReactionType) => {
    if (!accessToken) return
    toggleReaction(type)
  }

  const handleDelete = async () => {
    if (!accessToken) return
    const ok = await deny({ title: '¿Eliminar este post?', message: 'No se puede deshacer.', confirmLabel: 'Eliminar' })
    if (!ok) return
    await api.posts.delete(post.id, accessToken)
    qc.invalidateQueries({ queryKey: ['feed'] })
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`
    const text = post.content?.slice(0, 100) || 'Mira este post en Qhatu'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Qhatu', text, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShared(true); setTimeout(() => setShared(false), 1500)
      }
    } catch { /* cancelled */ }
  }

  const handleVote = async (optionId: string) => {
    if (!accessToken) return
    await api.posts.vote(post.id, optionId, accessToken)
    qc.invalidateQueries({ queryKey: ['feed'] })
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors"
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar seed={post.authorAvatarSeed} size={38} frameId={post.authorFrame} imageUrl={post.authorAvatarUrl} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <NameEffect effectId={post.authorNameEffect} className="text-sm font-semibold text-white font-heading">
              {post.authorNickname}
            </NameEffect>
            {post.authorTitle && getReward(post.authorTitle) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-lavender font-body">
                {getReward(post.authorTitle)!.name}
              </span>
            )}
            {post.authorFaculty && (
              <span className="text-xs text-white/40 font-body">{post.authorFaculty}</span>
            )}
            {post.type === 'EPHEMERAL' && expiresIn !== null && (
              <span className="flex items-center gap-1 text-xs text-orange-400 font-body">
                <Clock size={11} />
                {expiresIn}h
              </span>
            )}
            {post.isIdentityRevealed && (
              <span className="flex items-center gap-1 text-xs text-lavender font-body">
                <Eye size={11} />
                revelado
              </span>
            )}
          </div>
          <span className="text-xs text-white/30 font-body">{formatDistanceToNow(post.createdAt)}</span>
        </div>

        {post.isMine && (
          <button
            type="button"
            onClick={handleDelete}
            title="Eliminar"
            className="text-white/30 hover:text-red-400 transition-colors p-1 -mr-1"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {post.content && (
        <p className="text-white/90 text-sm leading-relaxed font-body mb-3 whitespace-pre-wrap break-words">
          <RichText text={post.content} />
        </p>
      )}

      {post.media.length > 0 && (
        <div className={`mb-3 grid gap-1 rounded-xl overflow-hidden ${gridCols(post.media.length)}`}>
          {post.media.map((m, i) => (
            <div
              key={i}
              className={`relative bg-black/30 overflow-hidden ${
                post.media.length === 3 && i === 0 ? 'col-span-2' : ''
              } ${post.media.length === 1 ? '' : 'aspect-square'}`}
            >
              {m.type === 'IMAGE' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt="media"
                  loading="lazy"
                  className={post.media.length === 1 ? 'w-full max-h-[480px] object-cover' : 'w-full h-full object-cover'}
                />
              ) : (
                <video
                  src={m.url}
                  controls
                  preload="metadata"
                  className={post.media.length === 1 ? 'w-full max-h-[480px]' : 'w-full h-full object-cover'}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {post.poll && (
        <div className="mb-3 bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-xs font-semibold text-white/70 mb-2 font-body">{post.poll.question}</p>
          <div className="flex flex-col gap-2">
            {post.poll.options.map((opt) => {
              const total = post.poll!.options.reduce((s, o) => s + o.votesCount, 0)
              const pct   = total > 0 ? Math.round((opt.votesCount / total) * 100) : 0
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleVote(opt.id)}
                  className="relative block w-full text-left group"
                >
                  <div
                    className={`absolute inset-0 rounded-lg transition-all ${opt.isMyVote ? 'bg-primary/40' : 'bg-white/5'}`}
                    style={{ width: `${pct}%` }}
                  />
                  <div className={`relative flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${opt.isMyVote ? 'border-primary/50' : 'border-white/10 group-hover:border-primary/40'}`}>
                    <span className="text-xs text-white font-body">{opt.text}</span>
                    <span className="text-xs text-white/50 font-body">{pct}%</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
        <ReactionBar
          likesCount={post.likesCount}
          fireCount={post.fireCount}
          teaCount={post.teaCount}
          dedCount={post.dedCount}
          myReaction={post.myReaction}
          onReact={handleReact}
          loading={isPending}
        />

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
            showComments ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          <MessageCircle size={14} />
          {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
        </button>

        <button
          type="button"
          onClick={handleShare}
          title="Compartir"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150 ml-auto"
        >
          {shared ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
        </button>
      </div>

      <CommentSection postId={post.id} open={showComments} />
    </motion.article>
  )
}

function hoursLeft(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 3_600_000))
}

function gridCols(n: number): string {
  if (n === 1) return 'grid-cols-1'
  return 'grid-cols-2'
}

export const PostCard = memo(PostCardBase)