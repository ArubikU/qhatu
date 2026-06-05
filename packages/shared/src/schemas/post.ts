import { z } from 'zod'
import { EmbeddingSchema } from '../embedding'

export const MAX_POST_CHARS = 1000

export const CreatePostSchema = z.object({
  content: z.string().max(MAX_POST_CHARS).default(''),
  type: z.enum(['TEXT', 'POLL', 'EPHEMERAL']).default('TEXT'),
  isIdentityRevealed: z.boolean().default(false),
  poll: z.object({
    question: z.string().min(1).max(200),
    options: z.array(z.string().min(1).max(100)).min(2).max(4),
  }).optional(),
  // Up to 6 items (≤5 images, ≤1 video). Count rules enforced in use case.
  media: z.array(z.object({
    key:  z.string().min(1),
    type: z.enum(['IMAGE', 'VIDEO']),
  })).max(6).optional(),
  // Client-computed semantic embedding (384-dim, on-device WebGPU/WASM). Optional.
  embedding: EmbeddingSchema.optional(),
}).refine(
  (d) => d.content.trim().length > 0 || (d.media?.length ?? 0) > 0 || !!d.poll,
  { message: 'El post debe tener texto, media o una encuesta.' },
)

export const FeedQuerySchema = z.object({
  tab:      z.enum(['for-you', 'trending', 'recent', 'following']).default('for-you'),
  cursor:   z.string().optional(),
  faculty:  z.string().optional(),
  gender:   z.enum(['M', 'F', 'UNSPECIFIED']).optional(),
  ageRange: z.enum(['R18_20', 'R21_23', 'R24_PLUS']).optional(),
  type:     z.enum(['TEXT', 'POLL', 'EPHEMERAL']).optional(),
})

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(300),
})

export const ReactSchema = z.object({
  type: z.enum(['LIKE', 'FIRE', 'TEA', 'DED']),
})

export const PollVoteSchema = z.object({
  optionId: z.string().uuid(),
})

export const SearchQuerySchema = z.object({
  q:      z.string().min(1).max(100),
  cursor: z.string().optional(),
})

export type CreatePost    = z.infer<typeof CreatePostSchema>
export type FeedQuery     = z.infer<typeof FeedQuerySchema>
export type CreateComment = z.infer<typeof CreateCommentSchema>
export type React         = z.infer<typeof ReactSchema>
