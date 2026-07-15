/**
 * ScoreCalculator — pure domain service, zero I/O.
 *
 * Implements the 30-feature scoring algorithm from the PRD.
 * Used by:
 *   - scoreWorker: computeBaseScore → stored in Post.score
 *   - GetFeedUseCase: computeFinalScore → runtime personalisation
 */

// ─── Reaction weights ────────────────────────────────────────────────────────

const W = {
  likes:    1.0,
  fire:     1.5,
  tea:      1.3,
  ded:      1.2,
  comments: 2.0,
// shares no está implementado aún — sharesCount siempre llega como 0 desde el servidor
  shares:   2.5,
// polls multiplica pollVotesCount cuando el post es una encuesta
  polls:    0.8,
  reports: -5.0,
} as const

// ─── Input types ─────────────────────────────────────────────────────────────

export interface PostMetrics {
  likesCount:    number
  fireCount:     number
  teaCount:      number
  dedCount:      number
  commentsCount: number
  sharesCount:   number  // 0 for now
  pollVotesCount?: number  // votos de encuesta, opcional
  reportsCount:  number
  isPoll:        boolean
  isIdentityRevealed: boolean
  isEphemeral:   boolean
  hoursLeft:     number  // only relevant if ephemeral
  createdAt:     Date
  /** Current stored velocityScore (reactions/hr in last window) */
  velocityScore: number
  authorStreakCount: number
}

export interface ViewerContext {
  /** Viewer faculty matches post author faculty */
  facultyMatch:   boolean
  /** Viewer age range matches post author age range */
  ageMatch:       boolean
  /** Viewer follows post author */
  followsAuthor:  boolean
  /** One or more of post hashtags is followed by viewer */
  followsHashtag: boolean
  /** Affinity score viewer→author [0, 1] */
  authorAffinity: number
  /** Post already seen by viewer this session */
  seenInSession:  boolean
  /** How many times viewer has seen this author today */
  authorSeenToday: number
  /** Post embedding cosine similarity to viewer interests [0, 1] (0 if pgvector not yet enabled) */
  embeddingSimilarity: number
  /** Hour of the day (0–23) — matches viewer's active hour? */
  timeOfDayMatch: boolean
  /** Viewer is a new user with no follows/affinities → cold start */
  isColdStart: boolean
}

// ─── Base score (stored in DB, computed by workers) ──────────────────────────

export interface BaseScoreResult {
  score: number
  velocityScore: number
}

export function computeBaseScore(metrics: PostMetrics): number {
  const hoursAge = Math.max(
    0,
    (Date.now() - metrics.createdAt.getTime()) / 3_600_000,
  )

  const engagement =
    metrics.likesCount    * W.likes    +
    metrics.fireCount     * W.fire     +
    metrics.teaCount      * W.tea      +
    metrics.dedCount      * W.ded      +
    metrics.commentsCount * W.comments +
    // ─── polls multiplica pollVotesCount, no commentsCount — evita doble conteo ───
    (metrics.isPoll ? (metrics.pollVotesCount ?? 0) * W.polls : 0) +
    metrics.reportsCount  * W.reports

  const baseScore = engagement / Math.log2(hoursAge + 2)

  return Math.max(0, baseScore)
}

// ─── Velocity score (EMA update called by workers) ───────────────────────────

/**
 * Update velocity score using Exponential Moving Average.
 * Call on each new interaction.
 * alpha=0.1 means slow smoothing — recent interactions matter but don't spike too hard.
 */
export function updateVelocity(currentVelocity: number, newValue: number): number {
  return 0.9 * currentVelocity + 0.1 * newValue
}

// ─── Final personal score (computed at feed time) ─────────────────────────────

export function computeFinalScore(metrics: PostMetrics, viewer: ViewerContext): number {
  const base = computeBaseScore(metrics)

  // ── Personal boost factors ─────────────────────────────────────────────────
  let boost = 1.0
  boost += Math.min(viewer.authorAffinity * 0.05, 0.50)   // follow history → max +0.50
  boost += (viewer.facultyMatch   ? 0.15 : 0)
  boost += (viewer.ageMatch       ? 0.10 : 0)
  boost += Math.min(viewer.embeddingSimilarity * 0.20, 0.20) // pgvector similarity
  boost += (viewer.followsAuthor  ? 0.35 : 0)
  boost += (viewer.followsHashtag ? 0.25 : 0)
  boost += (viewer.timeOfDayMatch ? 0.10 : 0)
  boost -= (viewer.seenInSession  ? 0.20 : 0)              // repetition penalty

  // ── Bonuses added to final score (not multiplied by boost) ────────────────
  const ephemeralBonus  = metrics.isEphemeral && metrics.hoursLeft < 4
    ? base * 0.4
    : 0

  const identityBonus   = metrics.isIdentityRevealed ? 0.25 : 0

  const velocityBonus   = Math.min(metrics.velocityScore * 0.3, 2.0)

  // Author streak bonus: +0.05 per streak day, max +1.0
  const authorStreakBonus = Math.min(metrics.authorStreakCount * 0.05, 1.0)

  // Seen penalty — drastically reduces score for already-seen posts
  const seenMultiplier  = viewer.seenInSession ? 0.05 : 1.0

  // Feedback fatigue: >10 posts from same author seen today → heavy demotion
  const fatigueMultiplier = viewer.authorSeenToday > 10 ? 0.3 : 1.0

  // Cold-start: new users get a flatter, engagement-led feed.
  // Damp personal boost (they have none anyway) and lean on raw popularity.
  const coldStartLift = viewer.isColdStart ? base * 0.3 : 0

  const finalScore = Math.max(
    0,
    (base * boost + authorStreakBonus + velocityBonus + ephemeralBonus + identityBonus + coldStartLift)
      * seenMultiplier
      * fatigueMultiplier,
  )

  return finalScore
}

// ─── Post-ranking heuristics ─────────────────────────────────────────────────

export interface RankedPost<T> {
  post: T
  score: number
}

/**
 * Apply post-ranking heuristics to a pre-scored list.
 * Modifies scores in-place, then returns sorted + trimmed list.
 */
export function applyHeuristics<T extends {
  id: string
  authorId: string
  type: string
  createdAt: Date
  reportsCount: number
  velocityScore: number
}>(
  ranked: RankedPost<T>[],
  limit: number,
): RankedPost<T>[] {
  const now      = Date.now()
  const twoHours = 2 * 3_600_000

  // 1. Sort descending
  ranked.sort((a, b) => b.score - a.score)

  // 2. Report cascade penalty
  for (const r of ranked) {
    if (r.post.reportsCount >= 5) {
      r.score = 0  // hidden
    } else if (r.post.reportsCount >= 3) {
      r.score *= 0.20
    } else if (r.post.reportsCount >= 1) {
      r.score *= 0.80
    }
  }

  // 3. Author diversity: max 2 posts per author in top-20
  const authorCount = new Map<string, number>()
  for (const r of ranked) {
    const cnt = authorCount.get(r.post.authorId) ?? 0
    if (cnt >= 2) {
      r.score *= 0.3  // feedback fatigue penalty
    }
    authorCount.set(r.post.authorId, cnt + 1)
  }

  // 4. Re-sort after penalties
  ranked.sort((a, b) => b.score - a.score)

  // 5. Freshness guarantee: ensure at least 3 posts from last 2h in top positions
  const freshPosts    = ranked.filter((r) => now - r.post.createdAt.getTime() < twoHours)
  const nonFreshPosts = ranked.filter((r) => now - r.post.createdAt.getTime() >= twoHours)

  const merged: RankedPost<T>[] = []
  let freshUsed = 0
  let ni = 0
  let fi = 0

  while (merged.length < limit) {
    // ─── Activa frescura desde el inicio si hay pocos candidatos ───
    const needsFresh = freshUsed < 3 && fi < freshPosts.length && merged.length >= Math.min(6, ranked.length - 1)
    if (needsFresh) {
      merged.push(freshPosts[fi++]!)
      freshUsed++
    } else if (ni < nonFreshPosts.length && (fi >= freshPosts.length || (nonFreshPosts[ni]?.score ?? 0) >= (freshPosts[fi]?.score ?? 0))) {
      merged.push(nonFreshPosts[ni++]!)
    } else if (fi < freshPosts.length) {
      merged.push(freshPosts[fi++]!)
    } else {
      break
    }
  }

  // Fill if still short
  if (merged.length < limit) {
    const inMerged = new Set(merged.map((r) => r.post.id))
    for (const r of ranked) {
      if (!inMerged.has(r.post.id)) {
        merged.push(r)
        if (merged.length >= limit) break
      }
    }
  }

  // 6. Trending injection — surface the highest-velocity post into positions 3–5
  //    if it isn't already near the top. Keeps the feed lively for everyone.
  injectTrending(merged, ranked)

  // 7. Content-type balance — avoid 3+ consecutive posts of the same type
  balanceContentTypes(merged)

  return merged.slice(0, limit)
}

function injectTrending<T extends { id: string; velocityScore: number }>(
  feed: RankedPost<T>[],
  pool: RankedPost<T>[],
) {
  if (feed.length < 6) return

  // Highest velocity in the whole candidate pool
  const trending = [...pool].sort((a, b) => b.post.velocityScore - a.post.velocityScore)[0]
  if (!trending || trending.post.velocityScore <= 0) return

  const currentIdx = feed.findIndex((r) => r.post.id === trending.post.id)
  // Already in top 5 → nothing to do
  if (currentIdx !== -1 && currentIdx < 5) return

  // Remove if present further down, then splice into position 3
  if (currentIdx !== -1) feed.splice(currentIdx, 1)
  feed.splice(3, 0, trending)
}

function balanceContentTypes<T extends { type: string }>(feed: RankedPost<T>[]) {
  for (let i = 2; i < feed.length; i++) {
    const a = feed[i - 2]!.post.type
    const b = feed[i - 1]!.post.type
    const c = feed[i]!.post.type
    if (a === b && b === c) {
      // Find the next post with a different type and swap it up
      const swapIdx = feed.findIndex((r, j) => j > i && r.post.type !== c)
      if (swapIdx !== -1) {
        const tmp = feed[i]!
        feed[i] = feed[swapIdx]!
        feed[swapIdx] = tmp
      }
    }
  }
}
