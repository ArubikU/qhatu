import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { prisma } from '../infrastructure/db/prisma'
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository'

interface JwtPayload { sub: string; nickname: string }

const AvatarSchema = z.object({ avatarSeed: z.string().regex(/^[a-z0-9]{1,16}$/i, 'Seed inválido') })

const userRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const userRepo = new PrismaUserRepository(prisma)

  // ─── PATCH /users/me/avatar — change generated avatar (re-roll seed) ──────────
  app.patch(
    '/me/avatar',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: { body: zodToJsonSchema(AvatarSchema), response: { 200: zodToJsonSchema(z.object({ avatarSeed: z.string() })) } },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user = request.user as JwtPayload
      const body = AvatarSchema.parse(request.body)
      await userRepo.updateAvatarSeed(user.sub, body.avatarSeed)
      return reply.send({ avatarSeed: body.avatarSeed })
    },
  )

  // ─── GET /users/me ────────────────────────────────────────────────────────────
  app.get(
    '/me',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        response: {
          200: zodToJsonSchema(z.object({
            id:              z.string(),
            nickname:        z.string(),
            avatarSeed:      z.string(),
            avatarUrl:       z.string().nullable(),
            faculty:         z.string().nullable(),
            ageRange:        z.string().nullable(),
            universityDomain: z.string(),
            streakCount:     z.number(),
            prestige:        z.number(),
            totalLikesEarned: z.number(),
            createdAt:       z.string(),
            equipped: z.object({
              frame:      z.string().nullable(),
              nameEffect: z.string().nullable(),
              badge:      z.string().nullable(),
              title:      z.string().nullable(),
            }),
          })),
        },
      },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const jwt  = request.user as JwtPayload
      const user = await userRepo.findById(jwt.sub)
      if (!user) throw app.httpErrors.notFound('Usuario no encontrado.')
      // Equipped cosmetics for own profile rendering
      const eq = await prisma.user.findUnique({
        where: { id: jwt.sub },
        select: { prestige: true, avatarUrl: true, equippedFrame: true, equippedNameEffect: true, equippedBadge: true, equippedTitle: true },
      })
      return reply.send({
        id:               user.id,
        nickname:         user.nickname,
        avatarSeed:       user.avatarSeed,
        avatarUrl:        eq?.avatarUrl ?? null,
        faculty:          user.faculty,
        ageRange:         user.ageRange,
        universityDomain: user.universityDomain,
        streakCount:      user.streakCount,
        prestige:         eq?.prestige ?? 0,
        totalLikesEarned: user.totalLikesEarned,
        createdAt:        user.createdAt.toISOString(),
        equipped: {
          frame:      eq?.equippedFrame ?? null,
          nameEffect: eq?.equippedNameEffect ?? null,
          badge:      eq?.equippedBadge ?? null,
          title:      eq?.equippedTitle ?? null,
        },
      })
    },
  )

  // ─── GET /users/:nickname ─────────────────────────────────────────────────────
  app.get(
    '/:nickname',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        params: zodToJsonSchema(z.object({ nickname: z.string() })),
        response: {
          200: zodToJsonSchema(z.object({
            nickname:        z.string(),
            avatarSeed:      z.string(),
            faculty:         z.string().nullable(),
            universityDomain: z.string(),
            streakCount:     z.number(),
            totalLikesEarned: z.number(),
            createdAt:       z.string(),
          })),
        },
      },
    },
    async (request, reply) => {
      const { nickname } = request.params as { nickname: string }
      const user = await userRepo.findByNickname(nickname)
      if (!user) throw app.httpErrors.notFound('Usuario no encontrado.')
      // Public profile — never expose id or emailHash
      return reply.send({
        nickname:         user.nickname,
        avatarSeed:       user.avatarSeed,
        faculty:          user.faculty,
        universityDomain: user.universityDomain,
        streakCount:      user.streakCount,
        totalLikesEarned: user.totalLikesEarned,
        createdAt:        user.createdAt.toISOString(),
      })
    },
  )
}

export default userRoutes
