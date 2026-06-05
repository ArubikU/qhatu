import { Worker, Queue } from 'bullmq'
import { prisma } from '../db/prisma'
import { PrismaEmbeddingRepository } from '../repositories/PrismaEmbeddingRepository'
import { emaUpdate } from '../../domain/services/EmbeddingCalculator'

export const EMBEDDING_QUEUE = 'embedding-updates'

// How strongly each interaction pulls the user vector toward the post topic
const INTERACTION_WEIGHT: Record<string, number> = {
  LIKE:    0.5,
  FIRE:    0.7,
  TEA:     0.6,
  DED:     0.4,
  COMMENT: 1.0,
  DISMISS: -0.8,
}

function redisConnection() {
  return { url: process.env.REDIS_URL! }
}

export function createEmbeddingQueue() {
  return new Queue(EMBEDDING_QUEUE, { connection: redisConnection() })
}

export function startEmbeddingWorker() {
  const embeddingRepo = new PrismaEmbeddingRepository(prisma)

  const worker = new Worker(
    EMBEDDING_QUEUE,
    async (job) => {
      const { userId, postId, interactionType } = job.data as {
        userId: string
        postId: string
        interactionType: string
      }
      if (!userId || !postId) return

      const postVec = await embeddingRepo.getPostEmbedding(postId)
      if (!postVec) return

      const weight  = INTERACTION_WEIGHT[interactionType] ?? 0.3
      const current = (await embeddingRepo.getUserVector(userId)) ?? []
      const updated = emaUpdate(current, postVec, weight)

      await embeddingRepo.saveUserVector(userId, updated)
    },
    { connection: redisConnection(), concurrency: 5 },
  )

  worker.on('failed', (job, err) => {
    console.error(`[embeddingWorker] job ${job?.id} failed:`, err.message)
  })

  return worker
}
