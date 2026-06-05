// ─── Domain Types ─────────────────────────────────────────────────

export type AgeRange = 'R18_20' | 'R21_23' | 'R24_PLUS'
export type Gender   = 'M' | 'F' | 'UNSPECIFIED'
export type PostType = 'TEXT' | 'POLL' | 'EPHEMERAL'
export type ReactionType = 'LIKE' | 'FIRE' | 'TEA' | 'DED'
export type FeedTab  = 'for-you' | 'trending' | 'recent' | 'following'

export interface PublicUser {
  nickname: string
  avatarSeed: string
  streakCount: number
  faculty: string | null
}

export interface ReactionCounts {
  LIKE: number
  FIRE: number
  TEA: number
  DED: number
}

export interface PostDTO {
  id: string
  author: PublicUser
  content: string
  type: PostType
  isIdentityRevealed: boolean
  expiresAt: string | null
  score: number
  reactions: ReactionCounts
  commentsCount: number
  viewerReaction: ReactionType | null
  isTrending: boolean
  createdAt: string
  hashtags: string[]
  poll?: PollDTO
}

export interface PollDTO {
  id: string
  question: string
  options: PollOptionDTO[]
  totalVotes: number
  viewerVotedOptionId: string | null
}

export interface PollOptionDTO {
  id: string
  text: string
  votesCount: number
  percentage: number
}

export interface CommentDTO {
  id: string
  author: PublicUser
  content: string
  createdAt: string
}

export interface FeedResult {
  posts: PostDTO[]
  nextCursor: string | null
}

export interface FeedFilters {
  faculty?: string
  gender?: Gender
  ageRange?: AgeRange
  type?: PostType
}

export interface NotificationDTO {
  id: string
  type: string
  actorNickname: string | null
  postId: string | null
  read: boolean
  createdAt: string
}

export interface SearchResult {
  posts: PostDTO[]
  hashtags: HashtagDTO[]
  users: PublicUser[]
}

export interface HashtagDTO {
  id: string
  tag: string
  postsCount: number
  trendScore: number
}

export interface DailyRankingDTO {
  rank: number
  user: PublicUser
  value: number
}

export interface DailyRankingsDTO {
  date: string
  mostLikes: DailyRankingDTO[]
  mostPosts: DailyRankingDTO[]
  mostComments: DailyRankingDTO[]
}
