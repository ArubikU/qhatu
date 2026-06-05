import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { prisma } from '../infrastructure/db/prisma'

interface JwtPayload { sub: string; nickname: string }

const RankingsQuery = z.object({
  type: z.enum(['LIKES_RECEIVED', 'POSTS_PUBLISHED', 'COMMENTS_MADE']).default('LIKES_RECEIVED'),
})

const rankingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ─── GET /rankings — today's leaderboard for the viewer's university ──────────
  app.get(
    '/',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: { querystring: zodToJsonSchema(RankingsQuery) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const viewer = request.user as JwtPayload
      const query  = RankingsQuery.parse(request.query)

      const me = await prisma.user.findUnique({ where: { id: viewer.sub }, select: { universityDomain: true } })
      const domain = me?.universityDomain ?? ''

      const today = new Date(); today.setHours(0, 0, 0, 0)

      const rows = await prisma.dailyRanking.findMany({
        where:   { date: today, type: query.type, user: { universityDomain: domain } },
        orderBy: { rank: 'asc' },
        take:    50,
        select:  {
          rank: true, value: true,
          user: { select: { nickname: true, avatarSeed: true, equippedFrame: true, equippedTitle: true } },
        },
      })

      return reply.send({
        type: query.type,
        entries: rows.map((r) => ({
          rank:       r.rank,
          value:      r.value,
          nickname:   r.user.nickname,
          avatarSeed: r.user.avatarSeed,
          frame:      r.user.equippedFrame,
          title:      r.user.equippedTitle,
        })),
      })
    },
  )
}

export default rankingRoutes
