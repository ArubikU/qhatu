import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { prisma } from '../infrastructure/db/prisma'
import { PrismaSearchRepository } from '../infrastructure/repositories/PrismaSearchRepository'
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository'
import { SearchUseCase } from '../application/search/SearchUseCase'

interface JwtPayload { sub: string; nickname: string }

// POST so the optional 384-dim query embedding fits in the body
const SearchBody = z.object({
  q:         z.string().min(1).max(100),
  scope:     z.enum(['all', 'posts', 'users', 'hashtags']).default('all'),
  embedding: z.array(z.number()).length(384).optional(),
})

const searchRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const searchRepo = new PrismaSearchRepository(prisma)
  const userRepo   = new PrismaUserRepository(prisma)

  app.post(
    '/',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: { body: zodToJsonSchema(SearchBody) },
    },
    async (request, reply) => {
      // Public — no auth required. viewerId optional (search is global anyway).
      let viewerId = ''
      try { await request.jwtVerify(); viewerId = (request.user as JwtPayload).sub } catch { /* anon */ }
      const body = SearchBody.parse(request.body)
      const useCase = new SearchUseCase(searchRepo, userRepo)
      const result  = await useCase.execute({
        q: body.q, viewerId, scope: body.scope, embedding: body.embedding,
      })
      return reply.send(result)
    },
  )
}

export default searchRoutes
