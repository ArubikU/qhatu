'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PostCard } from '@/components/posts/PostCard'
import { pushWithFallback } from '@/lib/nav'

export function PostDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn:  () => api.posts.get(id),
    retry: false,
  })

  return (
    <div className="min-h-screen bg-carbon">
      <div className="sticky top-0 z-20 bg-carbon/70 backdrop-blur-2xl border-b border-white/[0.06] flex items-center gap-3 px-4 h-14">
        <button onClick={() => pushWithFallback(router, '/feed')} className="text-white/60 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <span className="text-[19px] font-bold text-white font-heading">Post</span>
      </div>

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-primary" /></div>
        ) : isError || !post ? (
          <div className="text-center py-20">
            <p className="text-white/50 text-sm font-body mb-4">Este post no existe o fue eliminado.</p>
            <button onClick={() => pushWithFallback(router, '/feed')} className="text-lavender text-sm font-body">Ir al feed</button>
          </div>
        ) : (
          <PostCard post={post} defaultCommentsOpen />
        )}
      </div>
    </div>
  )
}
