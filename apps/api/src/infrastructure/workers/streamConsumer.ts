/**
 * Stream consumer — reads from Redis Stream `qhatu:interactions`
 * and dispatches jobs to BullMQ queues for async processing.
 *
 * Runs as a background loop inside the API process.
 * Gracefully skips if Redis is not configured.
 */
import type { Redis } from 'ioredis'
import type { Queue } from 'bullmq'
import type { InteractionEventType } from '../../domain/ports/IStreamProducer'

const STREAM_KEY    = 'qhatu:interactions'
const CONSUMER_NAME = 'api-consumer'

// Group names must match CLAUDE.md spec
const GROUPS = {
  scoreUpdater:   'score-updater',
  affinityUpdater: 'affinity-updater',
  feedInvalidator: 'feed-invalidator',
} as const

async function ensureGroups(redis: Redis) {
  for (const group of Object.values(GROUPS)) {
    await redis
      .xgroup('CREATE', STREAM_KEY, group, '$', 'MKSTREAM')
      .catch((err: Error) => {
        // Ignore "already exists" error
        if (!err.message.includes('BUSYGROUP')) throw err
      })
  }
}

interface ParsedEvent {
  type: InteractionEventType
  postId?: string
  userId?: string
  authorId?: string
  universityDomain?: string
  reactionType?: string
  timestamp?: number
}

function parseFields(fields: string[]): ParsedEvent {
  const obj: Record<string, string> = {}
  for (let i = 0; i < fields.length; i += 2) {
    obj[fields[i]!] = fields[i + 1]!
  }
  return obj as unknown as ParsedEvent
}

export async function startStreamConsumer(
  redis: Redis,
  scoreQueue: Queue,
  affinityQueue: Queue,
  embeddingQueue: Queue,
  notificationQueue: Queue,
  onNewPost?: (universityDomain: string) => void,
) {
  await ensureGroups(redis)

  console.log('[streamConsumer] started, listening on', STREAM_KEY)

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // Read up to 10 messages, block for 2s if stream is empty
      const results = await redis.xreadgroup(
        'GROUP', GROUPS.scoreUpdater, CONSUMER_NAME,
        'COUNT', '10',
        'BLOCK', '2000',
        'STREAMS', STREAM_KEY, '>',
      ) as [string, [string, string[]][]][] | null

      if (!results) continue

      for (const [, messages] of results) {
        for (const [msgId, fields] of messages) {
          const event = parseFields(fields)

          // Dispatch score update job
          if (event.postId && (
            event.type === 'POST_CREATED' ||
            event.type === 'REACTION_ADDED' ||
            event.type === 'REACTION_REMOVED' ||
            event.type === 'COMMENT_CREATED'
          )) {
            await scoreQueue.add('update-score', { postId: event.postId }, {
              removeOnComplete: 100,
              removeOnFail: 50,
            })
          }

          // Dispatch affinity + embedding update jobs (interactions that signal interest)
          if (event.userId && event.authorId && event.userId !== event.authorId && (
            event.type === 'REACTION_ADDED' ||
            event.type === 'COMMENT_CREATED'
          )) {
            const interactionType = event.reactionType ?? (event.type === 'COMMENT_CREATED' ? 'COMMENT' : 'LIKE')
            await affinityQueue.add('update-affinity', {
              viewerId: event.userId,
              authorId: event.authorId,
              interactionType,
            }, { removeOnComplete: 100, removeOnFail: 50 })

            if (event.postId) {
              await embeddingQueue.add('update-embedding', {
                userId: event.userId,
                postId: event.postId,
                interactionType,
              }, { removeOnComplete: 100, removeOnFail: 50 })
            }
          }

          // Notification dispatch — reaction/comment/follow on someone's content
          if (event.authorId && event.userId && event.userId !== event.authorId && (
            event.type === 'REACTION_ADDED' ||
            event.type === 'COMMENT_CREATED' ||
            event.type === 'USER_FOLLOWED'
          )) {
            await notificationQueue.add('dispatch', {
              recipientId:  event.type === 'USER_FOLLOWED' ? event.authorId : event.authorId,
              actorId:      event.userId,
              type:         event.type,
              postId:       event.postId,
              reactionType: event.reactionType,
            }, { removeOnComplete: 200, removeOnFail: 50 })
          }

          // Feed invalidation: notify SSE clients
          if (event.type === 'POST_CREATED' && event.universityDomain && onNewPost) {
            onNewPost(event.universityDomain)
          }

          // ACK message so it's not re-delivered
          await redis.xack(STREAM_KEY, GROUPS.scoreUpdater, msgId)
        }
      }
    } catch (err) {
      console.error('[streamConsumer] error:', (err as Error).message)
      await new Promise((r) => setTimeout(r, 5000))  // back-off on error
    }
  }
}
