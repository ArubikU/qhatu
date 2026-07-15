import type { Post, PostType } from '../entities/Post'
import type { Comment } from '../entities/Comment'

export type ReactionType = 'LIKE' | 'FIRE' | 'TEA' | 'DED'

export interface CreatePostData {
  authorId: string
  content: string
  type: PostType
  isIdentityRevealed: boolean
  expiresAt: Date | null
  hashtagIds: string[]
  media?: { key: string; type: 'IMAGE' | 'VIDEO' }[]
  poll?: {
    question: string
    options: string[]
  }
}

export interface MediaItem {
  url: string
  type: 'IMAGE' | 'VIDEO'
}

export interface FeedOptions {
  tab: 'for-you' | 'trending' | 'recent' | 'following'
  viewerId: string
  cursor?: string
  limit: number
}

export interface PostWithMeta extends Post {
  authorNickname: string
  authorAvatarSeed: string
  authorAvatarUrl: string | null
  authorFaculty: string | null
  authorFrame: string | null       // equipped FRAME id (shown always — tied to avatar identity)
  authorNameEffect: string | null  // equipped NAME_EFFECT id (only when identity revealed)
  authorTitle: string | null       // equipped TITLE id (only when identity revealed)
  isMine: boolean                  // viewer is the author (enables delete) — authorId never sent to client
  authorStreakCount: number        // racha de días activos del autor para el algoritmo de feed
  hashtags: string[]
  media: MediaItem[]
  myReaction: ReactionType | null
  poll: {
    id: string
    question: string
    options: { id: string; text: string; votesCount: number; isMyVote: boolean }[]
  } | null
}

export interface ViewerFeedContext {
  faculty:          string | null
  ageRange:         string | null
  followedNicknames: string[]
  followedHashtags:  string[]
  seenPostIds:       string[]
  authorAffinities:  Record<string, number>  // authorId → affinity score
  authorSeenToday:   Record<string, number>  // authorId → #posts of theirs seen today
  isColdStart:       boolean                  // no follows + no affinities → new user
}

export interface IPostRepository {
  // Posts
  create(data: CreatePostData): Promise<Post>
  findById(id: string): Promise<Post | null>
  /** Public single post with author/media/hashtags/counts (no viewer context). */
  getPublicPost(id: string): Promise<PostWithMeta | null>
  softDelete(id: string): Promise<void>
  getFeed(opts: FeedOptions): Promise<PostWithMeta[]>
  /** S3: fetch wide candidate pool for personal ranking */
  getCandidates(viewerId: string, universityDomain: string, limit: number): Promise<PostWithMeta[]>
  /** S3: load viewer context for personalisation */
  getViewerFeedContext(viewerId: string): Promise<ViewerFeedContext>
  /** S3: record that viewer has seen these posts */
  markSeen(viewerId: string, postIds: string[]): Promise<void>
  /** S3: update Post.score and velocityScore */
  updateScore(postId: string, score: number, velocityScore: number): Promise<void>

  // Reactions
  findReaction(postId: string, userId: string, type: ReactionType): Promise<{ id: string } | null>
  addReaction(postId: string, userId: string, type: ReactionType): Promise<void>
  removeReaction(id: string, postId: string, type: ReactionType): Promise<void>

  // Comments
  createComment(postId: string, authorId: string, content: string): Promise<Comment>
  listComments(postId: string, cursor?: string, limit?: number): Promise<Comment[]>
  getCommentAuthorNickname(authorId: string): Promise<string>

  // Hashtags
  findOrCreateHashtag(tag: string): Promise<string> // returns id

  // Polls — single vote per poll per user (re-vote replaces prior choice)
  votePoll(postId: string, optionId: string, userId: string): Promise<void>
}
