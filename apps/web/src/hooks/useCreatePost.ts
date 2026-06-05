'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type MediaType } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface CreatePostVars {
  content: string
  type: 'TEXT' | 'POLL' | 'EPHEMERAL'
  isIdentityRevealed: boolean
  media?: { key: string; type: MediaType }[]
  embedding?: number[]
  poll?: { question: string; options: string[] }
}

export function useCreatePost() {
  const qc          = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)

  return useMutation({
    mutationFn: (vars: CreatePostVars) =>
      api.posts.create(vars, accessToken ?? ''),
    onSuccess: () => {
      // Invalidate all feed tabs so new post appears
      qc.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
