import { Worker, Queue } from 'bullmq'
import { prisma } from '../db/prisma'

export const AFFINITY_QUEUE = 'affinity-updates'

const REACTION_WEIGHT: Record<string, number> = {
  LIKE:    0.5,
  FIRE:    0.7,
  TEA:     0.6,
  COMMENT: 1.0,
}

function redisConnection() {
  return { url: process.env.REDIS_URL! }
}

export function createAffinityQueue() {
  return new Queue(AFFINITY_QUEUE, { connection: redisConnection() })
}

export function startAffinityWorker() {
  const worker = new Worker(
    AFFINITY_QUEUE,
    async (job) => {
      const { viewerId, authorId, interactionType } = job.data as {
        viewerId: string
        authorId: string
        interactionType: string
      }
      if (!viewerId || !authorId || viewerId === authorId) return

      const weight        = REACTION_WEIGHT[interactionType] ?? 0.3
      const existing      = await prisma.userAuthorAffinity.findUnique({
        where:  { viewerId_authorId: { viewerId, authorId } },
        select: { score: true },
      })
      const currentScore  = existing?.score ?? 0
      const newScore      = 0.9 * currentScore + 0.1 * weight

      await prisma.userAuthorAffinity.upsert({
        where:  { viewerId_authorId: { viewerId, authorId } },
        update: { score: newScore },
        create: { viewerId, authorId, score: newScore },
      })
    },
    { connection: redisConnection(), concurrency: 10 },
  )

  worker.on('failed', (job, err) => {
    console.error(`[affinityWorker] job ${job?.id} failed:`, err.message)
  })

  return worker
}
