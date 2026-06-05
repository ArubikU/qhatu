import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { prisma } from '../infrastructure/db/prisma'
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository'
import { PrismaQrLoginRepository } from '../infrastructure/repositories/PrismaQrLoginRepository'
import { QrLoginService } from '../application/auth/QrLoginService'
import { hashToken, generateRefreshToken } from '../infrastructure/security/hashToken'

interface JwtPayload { sub: string; nickname: string }

const RT_COOKIE = 'qhatu_rt'
const cookieOpts = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path:     '/api/auth',   // client-visible path through the Next proxy
  maxAge:   7 * 24 * 60 * 60,
}

const SessionBody = z.object({ sessionId: z.string().min(1) })

const qrRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const userRepo = new PrismaUserRepository(prisma)
  const qrRepo   = new PrismaQrLoginRepository(prisma)
  const service  = new QrLoginService(qrRepo)

  // ─── POST /auth/qr/create — desktop starts a session (unauth) ─────────────────
  app.post('/create', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async (_req, reply) => reply.send(await service.create()),
  )

  // ─── GET /auth/qr/status?s= — desktop polls (unauth) ──────────────────────────
  app.get(
    '/status',
    {
      config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
      schema: { querystring: zodToJsonSchema(z.object({ s: z.string().min(1) })) },
    },
    async (request, reply) => {
      const { s } = request.query as { s: string }
      return reply.send({ status: await service.status(s) })
    },
  )

  // ─── POST /auth/qr/approve — logged-in phone approves ─────────────────────────
  app.post(
    '/approve',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: { body: zodToJsonSchema(SessionBody) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user = request.user as JwtPayload
      const body = SessionBody.parse(request.body)
      try {
        await service.approve(body.sessionId, user.sub)
        return reply.send({ ok: true })
      } catch (err) {
        throw app.httpErrors.badRequest(err instanceof Error ? err.message : 'Error al aprobar')
      }
    },
  )

  // ─── POST /auth/qr/claim — desktop exchanges approved session for tokens ──────
  app.post(
    '/claim',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: { body: zodToJsonSchema(SessionBody) },
    },
    async (request, reply) => {
      const body   = SessionBody.parse(request.body)
      const userId = await service.claim(body.sessionId)
      if (!userId) throw app.httpErrors.unauthorized('Sesión QR no aprobada o expirada.')

      const user = await userRepo.findById(userId)
      if (!user) throw app.httpErrors.unauthorized('Usuario no encontrado.')

      // Issue tokens exactly like the OTP login path
      await userRepo.deleteExpiredRefreshTokens(user.id)
      const accessToken = app.jwt.sign({ sub: user.id, nickname: user.nickname }, { expiresIn: '15m' })

      const rawRefresh = generateRefreshToken()
      await userRepo.createRefreshToken(user.id, hashToken(rawRefresh), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      reply.setCookie(RT_COOKIE, rawRefresh, cookieOpts)

      return reply.send({
        accessToken,
        user: { nickname: user.nickname, avatarSeed: user.avatarSeed, faculty: user.faculty },
      })
    },
  )
}

export default qrRoutes
