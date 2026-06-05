import { Worker, Queue } from 'bullmq'
import { prisma } from '../db/prisma'
import { computeBaseScore, updateVelocity, type PostMetrics } from '../../domain/services/ScoreCalculator'

export const SCORE_QUEUE = 'score-updates'

function redisConnection() {
  const url = process.env.REDIS_URL!
  return { url }
}

export function createScoreQueue() {
  return new Queue(SCORE_QUEUE, { connection: redisConnection() })
}

export function startScoreWorker() {
  const worker = new Worker(
    SCORE_QUEUE,
    async (job) => {
      const { postId } = job.data as { postId: string }
      if (!postId) return

      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          id:            true,
          likesCount:    true,
          fireCount:     true,
          teaCount:      true,
          dedCount:      true,
          commentsCount: true,
          reportsCount:  true,
          type:          true,
          isIdentityRevealed: true,
          expiresAt:     true,
          createdAt:     true,
          velocityScore: true,
          author:        { select: { streakCount: true } },
        },
      })

      if (!post) return

      const now        = Date.now()
      const hoursLeft  = post.expiresAt
        ? Math.max(0, (post.expiresAt.getTime() - now) / 3_600_000)
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
        createdAt:          post.createdAt,
        velocityScore:      post.velocityScore,
        authorStreakCount:  post.author.streakCount,
      }

      const newScore    = computeBaseScore(metrics)
      const newVelocity = updateVelocity(post.velocityScore, newScore * 0.1)

      await prisma.post.update({
        where: { id: postId },
        data: { score: newScore, velocityScore: newVelocity },
      })
    },
    { connection: redisConnection(), concurrency: 5 },
  )

  worker.on('failed', (job, err) => {
    console.error(`[scoreWorker] job ${job?.id} failed:`, err.message)
  })

  return worker
}
