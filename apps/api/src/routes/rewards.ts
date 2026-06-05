import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { prisma } from '../infrastructure/db/prisma'
import { PrismaGamificationRepository } from '../infrastructure/repositories/PrismaGamificationRepository'
import { GamificationService } from '../application/gamification/GamificationService'

interface JwtPayload { sub: string; nickname: string }

const EquipSchema = z.object({
  rewardId: z.string().nullable(),
  category: z.enum(['FRAME', 'NAME_EFFECT', 'BADGE', 'TITLE', 'STREAK_BADGE']),
})

const rewardRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const repo = new PrismaGamificationRepository(prisma)
  const gam  = new GamificationService(repo)

  // ─── GET /rewards/me — stats + owned + equipped (syncs first) ─────────────────
  app.get('/me', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (request, reply) => {
      await request.jwtVerify()
      const user = request.user as JwtPayload
      await gam.sync(user.sub)                 // grant any newly-earned rewards
      const profile = await gam.getProfile(user.sub)
      return reply.send(profile)
    },
  )

  // ─── POST /rewards/equip ──────────────────────────────────────────────────────
  app.post(
    '/equip',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: { body: zodToJsonSchema(EquipSchema) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user = request.user as JwtPayload
      const body = EquipSchema.parse(request.body)
      try {
        const equipped = await gam.equip(user.sub, body.rewardId, body.category)
        return reply.send({ equipped })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al equipar'
        throw app.httpErrors.badRequest(message)
      }
    },
  )
}

export default rewardRoutes
