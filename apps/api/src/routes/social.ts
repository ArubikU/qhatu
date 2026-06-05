import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { prisma } from '../infrastructure/db/prisma'
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository'
import { PrismaSocialRepository } from '../infrastructure/repositories/PrismaSocialRepository'
import { FollowUseCase } from '../application/social/FollowUseCase'
import { streamProducer } from '../app'

interface JwtPayload { sub: string; nickname: string }

const FollowSchema = z.object({
  targetNickname: z.string().min(1),
  action:         z.enum(['follow', 'unfollow']),
})

const socialRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const userRepo   = new PrismaUserRepository(prisma)
  const socialRepo = new PrismaSocialRepository(prisma)

  // ─── POST /social/follow ──────────────────────────────────────────────────────
  app.post(
    '/follow',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        body: zodToJsonSchema(FollowSchema),
        response: {
          200: zodToJsonSchema(z.object({ following: z.boolean() })),
        },
      },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const follower = request.user as JwtPayload
      const body     = FollowSchema.parse(request.body)
      const useCase  = new FollowUseCase(socialRepo, userRepo, streamProducer)
      try {
        const result = await useCase.execute({
          followerId:      follower.sub,
          targetNickname:  body.targetNickname,
          action:          body.action,
        })
        return reply.send(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al seguir usuario'
        if (message.includes('no encontrado')) throw app.httpErrors.notFound(message)
        throw app.httpErrors.badRequest(message)
      }
    },
  )

  // ─── GET /social/follow/:nickname ─────────────────────────────────────────────
  app.get(
    '/follow/:nickname',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        params: zodToJsonSchema(z.object({ nickname: z.string() })),
        response: {
          200: zodToJsonSchema(z.object({ following: z.boolean() })),
        },
      },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const follower = request.user as JwtPayload
      const { nickname } = request.params as { nickname: string }
      const following = await socialRepo.isFollowingUser(follower.sub, nickname)
      return reply.send({ following })
    },
  )
}

export default socialRoutes
