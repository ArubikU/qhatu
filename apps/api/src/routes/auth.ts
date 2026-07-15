import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import {
  RegisterSchema,
  VerifyOtpSchema,
} from '@qhatu/shared'
import { prisma } from '../infrastructure/db/prisma'
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository'
import { ResendEmailService } from '../infrastructure/email/ResendEmailService'
import { RegisterUseCase } from '../application/auth/RegisterUseCase'
import { VerifyOtpUseCase } from '../application/auth/VerifyOtpUseCase'
import { RefreshTokenUseCase } from '../application/auth/RefreshTokenUseCase'
import { RecoverAccountUseCase } from '../application/auth/RecoverAccountUseCase'
import { hashToken, generateOtp } from '../infrastructure/security/hashToken'
import { hashEmail } from '../infrastructure/security/hashEmail'
import { otpEmail } from '../infrastructure/email/templates'

// Refresh token cookie name
const RT_COOKIE = 'qhatu_rt'

// Cookie options (HttpOnly, Secure in prod, SameSite=Strict)
const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth',       // client-visible path through the Next proxy (browser hits /api/auth/*)
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
}

// Extended verify-otp schema includes optional profile fields
const VerifyOtpExtendedSchema = VerifyOtpSchema.extend({
  faculty:  z.string().optional(),
  ageRange: z.string().optional(),
  gender:   z.string().optional(),
})

// Login usa esto para decidir: cuenta existe → OTP, si no → registro
const EmailLookupSchema = z.object({
  email: RegisterSchema.shape.email,
})

const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const userRepo     = new PrismaUserRepository(prisma)
  const emailService = new ResendEmailService()

  // ─── POST /auth/email/status ────────────────────────────────────────────────
  // El login-first llama esto antes de nada — su ausencia rompía todo el login.
  app.post(
    '/email/status',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: {
        body: zodToJsonSchema(EmailLookupSchema),
        response: {
          200: zodToJsonSchema(z.object({ exists: z.boolean() })),
        },
      },
    },
    async (request, reply) => {
      const body = EmailLookupSchema.parse(request.body)
      const existing = await userRepo.findByEmailHash(hashEmail(body.email))
      return reply.send({ exists: Boolean(existing) })
    },
  )

  // ─── POST /auth/account/recover-request ───────────────────────────────────────
  // "Perdí mi cuenta" — envía OTP al correo de una cuenta existente.
  app.post(
    '/account/recover-request',
    {
      config: { rateLimit: { max: 3, timeWindow: '5 minutes' } },
      schema: {
        body: zodToJsonSchema(EmailLookupSchema),
        response: { 200: zodToJsonSchema(z.object({ message: z.string() })) },
      },
    },
    async (request, reply) => {
      const body = EmailLookupSchema.parse(request.body)
      const emailHash = hashEmail(body.email)
      const user = await userRepo.findByEmailHash(emailHash)
      // Solo enviamos si existe; respuesta genérica para no revelar existencia.
      if (user) {
        const otp = generateOtp()
        await userRepo.createOtpRequest(emailHash, hashToken(otp), new Date(Date.now() + 15 * 60 * 1000))
        emailService.send(body.email, otpEmail(otp)).catch(() => null)
      }
      return reply.send({ message: 'Si el correo tiene una cuenta, te enviamos un código.' })
    },
  )

  // ─── POST /auth/account/recover-confirm ───────────────────────────────────────
  // Valida OTP → reinicia identidad (posts intactos) → nueva sesión.
  const RecoverConfirmSchema = z.object({
    email: RegisterSchema.shape.email,
    otp:   z.string().length(6),
  })
  app.post(
    '/account/recover-confirm',
    {
      config: { rateLimit: { max: 5, timeWindow: '5 minutes' } },
      schema: {
        body: zodToJsonSchema(RecoverConfirmSchema),
        response: {
          200: zodToJsonSchema(
            z.object({
              accessToken: z.string(),
              user: z.object({
                nickname:   z.string(),
                avatarSeed: z.string(),
                faculty:    z.string().nullable(),
              }),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      const body = RecoverConfirmSchema.parse(request.body)
      const useCase = new RecoverAccountUseCase(userRepo, app.jwt)
      try {
        const { accessToken, refreshToken, user } = await useCase.execute({
          email:  body.email,
          otp:    body.otp,
          device: summariseUserAgent(request.headers['user-agent']),
        })
        reply.setCookie(RT_COOKIE, refreshToken, cookieOpts)
        return reply.send({ accessToken, user })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al recuperar la cuenta'
        throw app.httpErrors.badRequest(message)
      }
    },
  )

  // ─── POST /auth/register ────────────────────────────────────────────────────
  app.post(
    '/register',
    {
      config: { rateLimit: { max: 3, timeWindow: '1 minute' } },
      schema: {
        body: zodToJsonSchema(RegisterSchema),
        response: {
          200: zodToJsonSchema(z.object({ message: z.string() })),
        },
      },
    },
    async (request, reply) => {
      const body = RegisterSchema.parse(request.body)
      const useCase = new RegisterUseCase(userRepo, emailService)
      try {
        const result = await useCase.execute({ email: body.email })
        return reply.send(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al registrar'
        throw app.httpErrors.badRequest(message)
      }
    },
  )

  // ─── POST /auth/verify-otp ──────────────────────────────────────────────────
  app.post(
    '/verify-otp',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
      schema: {
        body: zodToJsonSchema(VerifyOtpExtendedSchema),
        response: {
          200: zodToJsonSchema(
            z.object({
              accessToken: z.string(),
              user: z.object({
                nickname:   z.string(),
                avatarSeed: z.string(),
                faculty:    z.string().nullable(),
              }),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      const body = VerifyOtpExtendedSchema.parse(request.body)
      const useCase = new VerifyOtpUseCase(userRepo, emailService, app.jwt)
      try {
        const { accessToken, refreshToken, user } = await useCase.execute({
          email:    body.email,
          otp:      body.otp,
          faculty:  body.faculty,
          ageRange: body.ageRange,
          gender:   body.gender,
          device:   summariseUserAgent(request.headers['user-agent']),
        })
        // Set refresh token as HttpOnly cookie — never exposed to JS
        reply.setCookie(RT_COOKIE, refreshToken, cookieOpts)
        return reply.send({ accessToken, user })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al verificar OTP'
        throw app.httpErrors.badRequest(message)
      }
    },
  )

  // ─── POST /auth/refresh ──────────────────────────────────────────────────────
  app.post(
    '/refresh',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: {
        response: {
          200: zodToJsonSchema(
            z.object({
              accessToken: z.string(),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      // Read refresh token from HttpOnly cookie
      const rawToken = request.cookies[RT_COOKIE]
      if (!rawToken) {
        throw app.httpErrors.unauthorized('No se encontró token de actualización.')
      }
      const useCase = new RefreshTokenUseCase(userRepo, app.jwt)
      try {
        const { accessToken, refreshToken } = await useCase.execute({ refreshToken: rawToken })
        // Rotate: overwrite cookie with new token
        reply.setCookie(RT_COOKIE, refreshToken, cookieOpts)
        return reply.send({ accessToken })
      } catch (err) {
        // Clear invalid cookie
        reply.clearCookie(RT_COOKIE, { path: '/api/auth' })
        const message = err instanceof Error ? err.message : 'Error al renovar token'
        throw app.httpErrors.unauthorized(message)
      }
    },
  )

  // ─── POST /auth/logout ───────────────────────────────────────────────────────
  app.post(
    '/logout',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: {
        response: {
          200: zodToJsonSchema(z.object({ message: z.string() })),
        },
      },
    },
    async (request, reply) => {
      // Verify JWT (will throw 401 if invalid/expired)
      await request.jwtVerify()

      const rawToken = request.cookies[RT_COOKIE]
      if (rawToken) {
        const tokenHash = hashToken(rawToken)
        const stored = await userRepo.findRefreshToken(tokenHash)
        if (stored) {
          await userRepo.deleteRefreshToken(stored.id)
        }
      }

      // Clear cookie regardless
      reply.clearCookie(RT_COOKIE, { path: '/api/auth' })
      return reply.send({ message: 'Sesión cerrada correctamente.' })
    },
  )
}

/** Compact, human-readable device string from a User-Agent header. */
function summariseUserAgent(ua?: string): string {
  if (!ua) return 'dispositivo desconocido'
  const browser =
    /Edg\//.test(ua)     ? 'Edge'    :
    /Chrome\//.test(ua)  ? 'Chrome'  :
    /Firefox\//.test(ua) ? 'Firefox' :
    /Safari\//.test(ua)  ? 'Safari'  : 'navegador'
  const os =
    /Windows/.test(ua)        ? 'Windows' :
    /Android/.test(ua)        ? 'Android' :
    /iPhone|iPad|iOS/.test(ua) ? 'iOS'     :
    /Mac OS X/.test(ua)       ? 'macOS'   :
    /Linux/.test(ua)          ? 'Linux'   : ''
  return os ? `${browser} en ${os}` : browser
}

export default authRoutes
