'use client'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type ReactionType, type FeedPage, type PostItem } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export type FeedTab = 'for-you' | 'trending' | 'recent' | 'following'

export function useFeed(tab: FeedTab = 'recent') {
  const accessToken = useAuthStore((s) => s.accessToken)
  const isPublic    = !accessToken

  return useInfiniteQuery<FeedPage, Error>({
    // include auth state in key so it refetches when the user logs in
    queryKey: ['feed', tab, isPublic ? 'public' : 'auth'],
    queryFn:  ({ pageParam }) => {
      const cursor = pageParam as string | undefined
      // Logged out → public read-only feed (recent/trending only)
      if (isPublic) return api.posts.publicFeed({ tab, cursor })
      return api.posts.feed({ tab, cursor }, accessToken)
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: true,
  })
}

export function useToggleReaction(postId: string, tab: FeedTab = 'recent') {
  const qc          = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)
  const isPublic    = !accessToken

  // ─── Clave exacta del tab activo — evita cancelar y restaurar otras tabs ───
  const feedKey = ['feed', tab, isPublic ? 'public' : 'auth']

  return useMutation({
    mutationFn: (type: ReactionType) =>
      api.posts.react(postId, type, accessToken ?? ''),

    // ─── Optimistic update solo en el tab activo, no en todos ───
    onMutate: async (type) => {
      await qc.cancelQueries({ queryKey: feedKey })

      const snapshot = qc.getQueryData<{ pages: FeedPage[] }>(feedKey)

      qc.setQueryData<{ pages: FeedPage[] }>(
        feedKey,
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id !== postId ? p : optimisticToggle(p, type),
              ),
            })),
          }
        },
      )

      return { snapshot }
    },

    // ─── Rollback solo del tab activo si el servidor falla ───
    onError: (_err, _type, ctx) => {
      if (ctx?.snapshot) {
        qc.setQueryData(feedKey, ctx.snapshot)
      }
    },

    // ─── Invalida solo el tab activo, no todas las tabs ───
    onSettled: () => {
      qc.invalidateQueries({ queryKey: feedKey })
    },
  })
}

function optimisticToggle(post: PostItem, type: ReactionType): PostItem {
  const countField = {
    LIKE: 'likesCount',
    FIRE: 'fireCount',
    TEA:  'teaCount',
    DED:  'dedCount',
  } as const

  const field = countField[type]
  const isRemoving = post.myReaction === type

  return {
    ...post,
    myReaction: isRemoving ? null : type,
    [field]: (post[field] as number) + (isRemoving ? -1 : 1),
  }
}