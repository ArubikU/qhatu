'use client'
import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { useComments, useAddComment } from '@/hooks/useComments'
import { useAuthStore } from '@/store/authStore'
import type { CommentsPage } from '@/lib/api'
import { formatDistanceToNow } from '@/lib/timeFormat'

interface CommentSectionProps {
  postId: string
  open: boolean
}

export function CommentSection({ postId, open }: CommentSectionProps) {
  const [text, setText] = useState('')
  const accessToken = useAuthStore((s) => s.accessToken)
  const { data, isFetching, fetchNextPage, hasNextPage } = useComments(postId, open)
  const addComment = useAddComment(postId)

  const comments = data?.pages.flatMap((p) => (p as CommentsPage).comments) ?? []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content || addComment.isPending) return
    await addComment.mutateAsync(content)
    setText('')
  }

  if (!open) return null

  return (
    <div className="border-t border-white/5 pt-3 mt-1">
      {/* Comment input — only when logged in */}
      {accessToken && (
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Comenta anónimamente..."
          maxLength={300}
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors font-body"
        />
        <button
          type="submit"
          disabled={!text.trim() || addComment.isPending}
          className="w-9 h-9 rounded-full bg-primary disabled:bg-white/10 flex items-center justify-center transition-colors"
        >
          {addComment.isPending
            ? <Loader2 size={14} className="animate-spin text-white" />
            : <Send size={14} className="text-white" />
          }
        </button>
      </form>
      )}

      {/* Comments list */}
      {isFetching && comments.length === 0 ? (
        <div className="flex justify-center py-4">
          <Loader2 size={16} className="animate-spin text-white/30" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar seed={c.authorNickname} size={28} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-lavender font-heading truncate">
                    {c.authorNickname}
                  </span>
                  <span className="text-xs text-white/30 font-body flex-shrink-0">
                    {formatDistanceToNow(c.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-white/80 font-body break-words">{c.content}</p>
              </div>
            </div>
          ))}

          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              className="text-xs text-lavender hover:text-white transition-colors font-body text-left"
            >
              Ver más comentarios
            </button>
          )}
        </div>
      )}
    </div>
  )
}
