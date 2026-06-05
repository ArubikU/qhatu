import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { prisma } from '../infrastructure/db/prisma'
import { PrismaNotificationRepository } from '../infrastructure/repositories/PrismaNotificationRepository'

interface JwtPayload { sub: string; nickname: string }

const SubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys:     z.object({ p256dh: z.string(), auth: z.string() }),
  }).passthrough(),
})

const notificationRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const notifRepo = new PrismaNotificationRepository(prisma)

  // ─── GET /notifications/vapid-public-key ──────────────────────────────────────
  app.get('/vapid-public-key', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (_req, reply) => reply.send({ publicKey: process.env.VAPID_PUBLIC_KEY ?? '' }),
  )

  // ─── GET /notifications ───────────────────────────────────────────────────────
  app.get(
    '/',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: { querystring: zodToJsonSchema(z.object({ cursor: z.string().optional() })) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user  = request.user as JwtPayload
      const query = request.query as { cursor?: string }
      const [items, unread] = await Promise.all([
        notifRepo.list(user.sub, query.cursor, 20),
        notifRepo.unreadCount(user.sub),
      ])
      return reply.send({
        notifications: items.map((n) => ({
          id: n.id, type: n.type, payload: n.payload, read: n.read,
          createdAt: n.createdAt.toISOString(),
        })),
        unreadCount: unread,
        nextCursor:  items.length === 20 ? items[items.length - 1]!.id : null,
      })
    },
  )

  // ─── GET /notifications/unread-count ──────────────────────────────────────────
  app.get('/unread-count', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } },
    async (request, reply) => {
      await request.jwtVerify()
      const user = request.user as JwtPayload
      return reply.send({ count: await notifRepo.unreadCount(user.sub) })
    },
  )

  // ─── POST /notifications/read/:id ─────────────────────────────────────────────
  app.post(
    '/read/:id',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: { params: zodToJsonSchema(z.object({ id: z.string() })) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user   = request.user as JwtPayload
      const { id } = request.params as { id: string }
      await notifRepo.markRead(user.sub, id)
      return reply.send({ ok: true })
    },
  )

  // ─── POST /notifications/read-all ─────────────────────────────────────────────
  app.post('/read-all', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async (request, reply) => {
      await request.jwtVerify()
      const user = request.user as JwtPayload
      await notifRepo.markAllRead(user.sub)
      return reply.send({ ok: true })
    },
  )

  // ─── POST /notifications/subscribe ────────────────────────────────────────────
  app.post(
    '/subscribe',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      schema: { body: zodToJsonSchema(SubscribeSchema) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user = request.user as JwtPayload
      const body = SubscribeSchema.parse(request.body)
      await notifRepo.savePushSubscription(user.sub, JSON.stringify(body.subscription))
      return reply.send({ ok: true })
    },
  )
}

export default notificationRoutes
