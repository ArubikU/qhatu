export type PostType = 'TEXT' | 'POLL' | 'EPHEMERAL'
export type MediaType = 'IMAGE' | 'VIDEO'

export interface Post {
  id: string
  authorId: string
  content: string
  type: PostType
  score: number
  velocityScore: number
  isIdentityRevealed: boolean
  reportsCount: number
  likesCount: number
  fireCount: number
  teaCount: number
  dedCount: number
  commentsCount: number
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
