import { Worker, Queue } from 'bullmq'
import { prisma } from '../db/prisma'
import { PrismaNotificationRepository } from '../repositories/PrismaNotificationRepository'
import { WebPushService } from '../push/WebPushService'
import type { NotificationType } from '../../domain/ports/INotificationRepository'
import type { PushPayload } from '../../domain/ports/IPushService'

export const NOTIFICATION_QUEUE = 'notification-dispatch'

function redisConnection() {
  return { url: process.env.REDIS_URL! }
}

export function createNotificationQueue() {
  return new Queue(NOTIFICATION_QUEUE, { connection: redisConnection() })
}

const REACTION_LABEL: Record<string, string> = {
  LIKE: 'le gustó', FIRE: 'reaccionó 🔥 a', TEA: 'reaccionó ☕ a', DED: 'reaccionó 💀 a',
}

export function startNotificationWorker() {
  const notifRepo = new PrismaNotificationRepository(prisma)
  const push      = new WebPushService()

  const worker = new Worker(
    NOTIFICATION_QUEUE,
    async (job) => {
      const { recipientId, actorId, type, postId, reactionType } = job.data as {
        recipientId: string
        actorId: string
        type: 'REACTION_ADDED' | 'COMMENT_CREATED' | 'USER_FOLLOWED'
        postId?: string
        reactionType?: string
      }
      if (!recipientId || recipientId === actorId) return

      // Actor is anonymous in UI — notifications never reveal who, only what
      const { notifType, title, body } = buildNotification(type, reactionType)

      // Persist notification
      await notifRepo.create(recipientId, notifType, { postId, type, reactionType })

      // Send web-push to all of recipient's subscriptions
      if (push.isConfigured()) {
        const subs = await notifRepo.getPushSubscriptions(recipientId)
        const payload: PushPayload = {
          title,
          body,
          url: postId ? `/feed?post=${postId}` : '/notifications',
          tag: type,
        }
        for (const sub of subs) {
          const result = await push.send(sub.subscription, payload)
          if (result === 'expired') {
            await notifRepo.deletePushSubscription(sub.id)
          }
        }
      }
    },
    { connection: redisConnection(), concurrency: 10 },
  )

  worker.on('failed', (job, err) => {
    console.error(`[notificationWorker] job ${job?.id} failed:`, err.message)
  })

  return worker
}

function buildNotification(
  type: 'REACTION_ADDED' | 'COMMENT_CREATED' | 'USER_FOLLOWED',
  reactionType?: string,
): { notifType: NotificationType; title: string; body: string } {
  switch (type) {
    case 'REACTION_ADDED':
      return {
        notifType: 'REACTION',
        title:     'Nueva reacción',
        body:      `A alguien ${REACTION_LABEL[reactionType ?? 'LIKE'] ?? 'le gustó'} tu post`,
      }
    case 'COMMENT_CREATED':
      return { notifType: 'COMMENT', title: 'Nuevo comentario', body: 'Alguien comentó tu post' }
    case 'USER_FOLLOWED':
      return { notifType: 'NEW_FOLLOWER', title: 'Nuevo seguidor', body: 'Alguien empezó a seguirte' }
  }
}
