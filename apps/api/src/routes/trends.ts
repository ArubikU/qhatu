import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { prisma } from '../infrastructure/db/prisma'

/**
 * Public right-rail data: trending hashtags + suggested users.
 * No auth — used by logged-out and logged-in views alike.
 */
const trendsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (_req, reply) => {
    const [hashtags, users, postCount] = await Promise.all([
      prisma.hashtag.findMany({ orderBy: { postCount: 'desc' }, take: 8, select: { tag: true, postCount: true } }),
      prisma.user.findMany({
        where: { posts: { some: { deletedAt: null } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { nickname: true, avatarSeed: true, avatarUrl: true, faculty: true, universityDomain: true },
      }),
      prisma.post.count({ where: { deletedAt: null } }),
    ])
    return reply.send({
      hashtags: hashtags.map((h) => ({ tag: h.tag, postCount: h.postCount })),
      users:    users.map((u) => ({ nickname: u.nickname, avatarSeed: u.avatarSeed, avatarUrl: u.avatarUrl, faculty: u.faculty, university: u.universityDomain })),
      stats:    { totalPosts: postCount },
    })
  })
}

export default trendsRoutes
