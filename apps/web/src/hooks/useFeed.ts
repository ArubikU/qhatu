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
    // Always enabled — public when logged out
    enabled: true,
  })
}

export function useToggleReaction(postId: string) {
  const qc          = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)

  return useMutation({
    mutationFn: (type: ReactionType) =>
      api.posts.react(postId, type, accessToken ?? ''),

    // Optimistic update across all feed tabs
    onMutate: async (type) => {
      await qc.cancelQueries({ queryKey: ['feed'] })

      const snapshot = qc.getQueriesData<{ pages: FeedPage[] }>({ queryKey: ['feed'] })

      qc.setQueriesData<{ pages: FeedPage[] }>(
        { queryKey: ['feed'] },
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

    onError: (_err, _type, ctx) => {
      // Roll back
      if (ctx?.snapshot) {
        for (const [key, data] of ctx.snapshot) {
          qc.setQueryData(key, data)
        }
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['feed'] })
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
