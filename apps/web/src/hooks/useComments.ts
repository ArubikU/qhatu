'use client'
import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { api, type CommentsPage } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export function useComments(postId: string, enabled = false) {
  const accessToken = useAuthStore((s) => s.accessToken)

  return useInfiniteQuery<
    CommentsPage,
    Error,
    InfiniteData<CommentsPage>,
    string[],
    string | undefined
  >({
    queryKey:         ['comments', postId],
    queryFn:          ({ pageParam }) =>
      api.posts.comments(postId, accessToken ?? '', pageParam),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled,  // public — comments viewable without login
  })
}

export function useAddComment(postId: string) {
  const qc          = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)

  return useMutation({
    mutationFn: (content: string) =>
      api.posts.addComment(postId, content, accessToken ?? ''),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] })
      qc.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
