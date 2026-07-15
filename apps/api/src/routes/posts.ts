import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { CreatePostSchema, CreateCommentSchema, ReactSchema, FeedQuerySchema } from '@qhatu/shared'
import { prisma } from '../infrastructure/db/prisma'
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository'
import { PrismaPostRepository } from '../infrastructure/repositories/PrismaPostRepository'
import { CreatePostUseCase } from '../application/posts/CreatePostUseCase'
import { GetPostUseCase } from '../application/posts/GetPostUseCase'
import { DeletePostUseCase } from '../application/posts/DeletePostUseCase'
import { GetFeedUseCase } from '../application/posts/GetFeedUseCase'
import { ToggleReactionUseCase } from '../application/posts/ToggleReactionUseCase'
import { CreateCommentUseCase } from '../application/posts/CreateCommentUseCase'
import { ListCommentsUseCase } from '../application/posts/ListCommentsUseCase'
import { VotePollUseCase } from '../application/posts/VotePollUseCase'
import { S3StorageService } from '../infrastructure/storage/S3StorageService'
import { PrismaEmbeddingRepository } from '../infrastructure/repositories/PrismaEmbeddingRepository'
import { PrismaGamificationRepository } from '../infrastructure/repositories/PrismaGamificationRepository'
import { GamificationService } from '../application/gamification/GamificationService'
import { streamProducer } from '../streamProducer'

interface JwtPayload { sub: string; nickname: string }

const postRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const storage       = new S3StorageService()
  const postRepo      = new PrismaPostRepository(prisma, storage)
  const userRepo      = new PrismaUserRepository(prisma)
  const embeddingRepo = new PrismaEmbeddingRepository(prisma)
  const gamification  = new GamificationService(new PrismaGamificationRepository(prisma))

  // ─── GET /posts/feed ─────────────────────────────────────────────────────────
  app.get(
    '/feed',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: { querystring: zodToJsonSchema(FeedQuerySchema) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const viewer  = request.user as JwtPayload
      const query   = FeedQuerySchema.parse(request.query)
      // ─── use case instanciado por request — pendiente mover fuera del handler ───
      const useCase = new GetFeedUseCase(postRepo, userRepo, embeddingRepo)
      const result  = await useCase.execute({
        tab:      query.tab,
        viewerId: viewer.sub,
        cursor:   query.cursor,
      })
      return reply.send(result)
    },
  )

  // ─── GET /posts/public — no auth, read-only feed (landing / logged-out) ───────
  const PublicFeedQuerySchema = z.object({
    tab:    z.enum(['recent', 'trending']).default('recent'),
    cursor: z.string().optional(),
  })
  app.get(
    '/public',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        querystring: zodToJsonSchema(PublicFeedQuerySchema),
      },
    },
    async (request, reply) => {
      // ─── Validación real con Zod (no cast) — mismo patrón que /posts/feed ───
      const query   = PublicFeedQuerySchema.parse(request.query)
      // ─── use case instanciado por request — pendiente mover fuera del handler ───
      const useCase = new GetFeedUseCase(postRepo, userRepo, embeddingRepo)
      // viewerId '' → no per-viewer reactions/ownership; simple recent/trending sort
      const result  = await useCase.execute({ tab: query.tab, viewerId: '', cursor: query.cursor })
      return reply.send(result)
    },
  )

  // ─── GET /posts/:id — public single post (for share links + OG metadata) ──────
  app.get(
    '/:id',
    {
      config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
      schema: { params: zodToJsonSchema(z.object({ id: z.string() })) },
    },
    async (request, reply) => {
      // ─── Ahora pasa por GetPostUseCase — mismo patrón que el resto de rutas ───
      const { id } = request.params as { id: string }
      const useCase = new GetPostUseCase(postRepo)
      const post = await useCase.execute(id)
        if (!post) throw app.httpErrors.notFound('Post no encontrado.')
    return reply.send(post)
    },
  )

  // ─── POST /posts ──────────────────────────────────────────────────────────────
  app.post(
    '/',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      schema: { body: zodToJsonSchema(CreatePostSchema) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const author  = request.user as JwtPayload
      const body    = CreatePostSchema.parse(request.body)
      // ─── use case instanciado por request — pendiente mover fuera del handler ───
      const useCase = new CreatePostUseCase(postRepo, userRepo, streamProducer, embeddingRepo)
      try {
        const post = await useCase.execute({
          authorId:           author.sub,
          content:            body.content,
          type:               body.type,
          isIdentityRevealed: body.isIdentityRevealed,
          media:              body.media,
          embedding:          body.embedding,
          poll:               body.poll ? { question: body.poll.question, options: body.poll.options } : undefined,
        })
        // Gamification: streak bump + grant earned rewards (non-blocking)
        gamification.onPost(author.sub, {
          revealedIdentity: body.isIdentityRevealed,
          isEphemeral:      body.type === 'EPHEMERAL',
        }).catch(() => null)

        return reply.code(201).send(post)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al crear post'
        throw app.httpErrors.badRequest(message)
      }
    },
  )

  // ─── DELETE /posts/:id ────────────────────────────────────────────────────────
  app.delete(
    '/:id',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: { params: zodToJsonSchema(z.object({ id: z.string() })) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const requester = request.user as JwtPayload
      const { id }    = request.params as { id: string }
      const useCase   = new DeletePostUseCase(postRepo)
      try {
        await useCase.execute({ postId: id, requesterId: requester.sub })
        return reply.send({ message: 'Post eliminado.' })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar post'
        if (message.includes('permiso')) throw app.httpErrors.forbidden(message)
        throw app.httpErrors.notFound(message)
      }
    },
  )

  // ─── POST /posts/:id/react ────────────────────────────────────────────────────
  app.post(
    '/:id/react',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        body: zodToJsonSchema(ReactSchema),
        params: zodToJsonSchema(z.object({ id: z.string() })),
      },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user    = request.user as JwtPayload
      const { id }  = request.params as { id: string }
      const body    = ReactSchema.parse(request.body)
      const useCase = new ToggleReactionUseCase(postRepo, streamProducer)
      try {
        const result = await useCase.execute({ postId: id, userId: user.sub, type: body.type })
        return reply.send(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al reaccionar'
        throw app.httpErrors.notFound(message)
      }
    },
  )

  // ─── POST /posts/:id/vote ─────────────────────────────────────────────────────
  app.post(
    '/:id/vote',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        body: zodToJsonSchema(z.object({ optionId: z.string().min(1) })),
        params: zodToJsonSchema(z.object({ id: z.string() })),
      },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user   = request.user as JwtPayload
      const { id } = request.params as { id: string }
      const body   = request.body as { optionId: string }
      const useCase = new VotePollUseCase(postRepo)
      try {
        await useCase.execute({ postId: id, optionId: body.optionId, userId: user.sub })
        return reply.send({ ok: true })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al votar'
        throw app.httpErrors.badRequest(message)
      }
    },
  )

  // ─── GET /posts/:id/comments ──────────────────────────────────────────────────
  app.get(
    '/:id/comments',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        params:      zodToJsonSchema(z.object({ id: z.string() })),
        querystring: zodToJsonSchema(z.object({
          cursor: z.string().optional(),
          limit:  z.coerce.number().min(1).max(50).default(20),
        })),
      },
    },
    async (request, reply) => {
      // Public — comments are visible without login
      const { id }  = request.params as { id: string }
      const query   = request.query as { cursor?: string; limit: number }
      const useCase = new ListCommentsUseCase(postRepo)
      const result  = await useCase.execute({ postId: id, cursor: query.cursor, limit: query.limit })
      return reply.send(result)
    },
  )

  // ─── POST /posts/:id/comments ─────────────────────────────────────────────────
  app.post(
    '/:id/comments',
    {
      config: { rateLimit: { max: 15, timeWindow: '1 minute' } },
      schema: {
        body:   zodToJsonSchema(CreateCommentSchema),
        params: zodToJsonSchema(z.object({ id: z.string() })),
      },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const author  = request.user as JwtPayload
      const { id }  = request.params as { id: string }
      const body    = CreateCommentSchema.parse(request.body)
      const useCase = new CreateCommentUseCase(postRepo, streamProducer)
      try {
        const comment = await useCase.execute({ postId: id, authorId: author.sub, content: body.content })
        return reply.code(201).send(comment)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al comentar'
        throw app.httpErrors.notFound(message)
      }
    },
  )
}

export default postRoutes
