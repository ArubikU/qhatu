import { getRedis, newRedisConnection } from '../redis/redis'
import { createScoreQueue, startScoreWorker } from './scoreWorker'
import { createAffinityQueue, startAffinityWorker } from './affinityWorker'
import { createEmbeddingQueue, startEmbeddingWorker } from './embeddingWorker'
import { createNotificationQueue, startNotificationWorker } from './notificationWorker'
import { startStreamConsumer } from './streamConsumer'
import { notifyNewPost } from '../../routes/stream'

export async function setupWorkers() {
  if (!process.env.REDIS_URL) {
    console.log('[workers] REDIS_URL not set — workers disabled (dev mode)')
    return
  }

  try {
    const scoreQueue        = createScoreQueue()
    const affinityQueue     = createAffinityQueue()
    const embeddingQueue    = createEmbeddingQueue()
    const notificationQueue = createNotificationQueue()

    startScoreWorker()
    startAffinityWorker()
    startEmbeddingWorker()
    startNotificationWorker()

    const consumerConn = newRedisConnection()
    await consumerConn.connect()

    startStreamConsumer(
      consumerConn,
      scoreQueue,
      affinityQueue,
      embeddingQueue,
      notificationQueue,
      (domain) => {
        notifyNewPost(domain)
        const redis = getRedis()
        if (redis) {
          redis.publish(
            `feed:updates:${domain}`,
            JSON.stringify({ type: 'NEW_POSTS', universityDomain: domain }),
          ).catch(() => null)
        }
      },
    ).catch((err) => console.error('[streamConsumer] fatal:', err.message))

    console.log('[workers] BullMQ workers (score, affinity, embedding, notification) + stream consumer started')
  } catch (err) {
    console.error('[workers] failed to start:', (err as Error).message)
  }
}
