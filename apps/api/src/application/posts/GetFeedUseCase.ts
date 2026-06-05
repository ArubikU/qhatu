import type { IPostRepository, PostWithMeta } from '../../domain/ports/IPostRepository'
import type { IUserRepository } from '../../domain/ports/IUserRepository'
import type { IEmbeddingRepository } from '../../domain/ports/IEmbeddingRepository'
import {
  computeFinalScore,
  applyHeuristics,
  type PostMetrics,
  type ViewerContext,
} from '../../domain/services/ScoreCalculator'
import { cosineSimilarity } from '../../domain/services/EmbeddingCalculator'

interface GetFeedInput {
  tab: 'for-you' | 'trending' | 'recent' | 'following'
  viewerId: string
  cursor?: string
  limit?: number
}

// authorId is used internally for ranking but NEVER sent to the client (anonymity)
type PublicPost = Omit<PostWithMeta, 'authorId'>

interface GetFeedOutput {
  posts: PublicPost[]
  nextCursor: string | null
}

function strip(posts: PostWithMeta[]): PublicPost[] {
  return posts.map(({ authorId: _authorId, ...rest }) => rest)
}

const CANDIDATE_POOL = 150  // fetch wider pool for ranking

export class GetFeedUseCase {
  constructor(
    private readonly postRepo: IPostRepository,
    private readonly userRepo: IUserRepository,
    private readonly embeddingRepo: IEmbeddingRepository,
  ) {}

  async execute(input: GetFeedInput): Promise<GetFeedOutput> {
    const limit = input.limit ?? 20

    // ── Simple tabs: delegate to plain SQL sort ─────────────────────────────
    if (input.tab !== 'for-you') {
      const posts = await this.postRepo.getFeed({
        tab:      input.tab,
        viewerId: input.viewerId,
        cursor:   input.cursor,
        limit:    limit + 1,
      })
      const hasMore = posts.length > limit
      const page    = hasMore ? posts.slice(0, limit) : posts
      return { posts: strip(page), nextCursor: hasMore ? page[page.length - 1]!.id : null }
    }

    // ── For-you: full personalised ranking ─────────────────────────────────
    const viewer = await this.userRepo.findById(input.viewerId)
    if (!viewer) return { posts: [], nextCursor: null }

    const [candidates, viewerCtx, userVector] = await Promise.all([
      this.postRepo.getCandidates(input.viewerId, viewer.universityDomain, CANDIDATE_POOL),
      this.postRepo.getViewerFeedContext(input.viewerId),
      this.embeddingRepo.getUserVector(input.viewerId),
    ])

    const seenSet     = new Set(viewerCtx.seenPostIds)
    const followedSet = new Set(viewerCtx.followedNicknames)

    // Load post embeddings for cosine similarity (only if viewer has an interest vector)
    const postEmbeddings = userVector && userVector.length > 0
      ? await this.embeddingRepo.getPostEmbeddings(candidates.map((c) => c.id))
      : {}

    const ranked = candidates.map((post) => {
      const now       = Date.now()
      const hoursAge  = Math.max(0, (now - new Date(post.createdAt).getTime()) / 3_600_000)
      const hoursLeft = post.expiresAt
        ? Math.max(0, (new Date(post.expiresAt).getTime() - now) / 3_600_000)
        : 0

      const metrics: PostMetrics = {
        likesCount:         post.likesCount,
        fireCount:          post.fireCount,
        teaCount:           post.teaCount,
        dedCount:           post.dedCount,
        commentsCount:      post.commentsCount,
        sharesCount:        0,
        reportsCount:       post.reportsCount,
        isPoll:             post.type === 'POLL',
        isIdentityRevealed: post.isIdentityRevealed,
        isEphemeral:        post.type === 'EPHEMERAL',
        hoursLeft,
        createdAt:          new Date(post.createdAt),
        velocityScore:      post.velocityScore,
        authorStreakCount:  0,  // populated from user data in S4
      }

      const ctx: ViewerContext = {
        facultyMatch:       !!viewerCtx.faculty && viewerCtx.faculty === post.authorFaculty,
        ageMatch:           false,  // author age not exposed (anonymous) — always false
        followsAuthor:      followedSet.has(post.authorNickname),
        followsHashtag:     post.hashtags.some((t) => viewerCtx.followedHashtags.includes(t)),
        authorAffinity:     viewerCtx.authorAffinities[post.authorId] ?? 0,
        seenInSession:      seenSet.has(post.id),
        authorSeenToday:    viewerCtx.authorSeenToday[post.authorId] ?? 0,
        embeddingSimilarity: userVector && postEmbeddings[post.id]
          ? cosineSimilarity(userVector, postEmbeddings[post.id]!)
          : 0,
        timeOfDayMatch:     isActiveHour(),
        isColdStart:        viewerCtx.isColdStart,
      }

      return { post, score: computeFinalScore(metrics, ctx) }
    })

    // Apply post-ranking heuristics (diversity, freshness, report cascade)
    const heuristicPosts = applyHeuristics(ranked, CANDIDATE_POOL)

    // Cursor-based pagination on ranked result
    let startIdx = 0
    if (input.cursor) {
      const idx = heuristicPosts.findIndex((r) => r.post.id === input.cursor)
      if (idx !== -1) startIdx = idx + 1
    }

    const page    = heuristicPosts.slice(startIdx, startIdx + limit + 1)
    const hasMore = page.length > limit
    const result  = hasMore ? page.slice(0, limit) : page
    const posts   = result.map((r) => r.post)

    // Mark as seen (fire-and-forget — don't block response)
    this.postRepo.markSeen(input.viewerId, posts.map((p) => p.id)).catch(() => null)

    return {
      posts: strip(posts),
      nextCursor: hasMore ? posts[posts.length - 1]!.id : null,
    }
  }
}

function isActiveHour(): boolean {
  const hour = new Date().getHours()
  // University active hours: 7–22
  return hour >= 7 && hour <= 22
}
