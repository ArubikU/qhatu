import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { RegisterSchema } from '@qhatu/shared'
import { prisma } from '../infrastructure/db/prisma'
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository'
import { ResendEmailService } from '../infrastructure/email/ResendEmailService'
import { hashEmail } from '../infrastructure/security/hashEmail'
import { hashToken, generateOtp } from '../infrastructure/security/hashToken'
import { emailChangeEmail, accountDeletionEmail } from '../infrastructure/email/templates'

interface JwtPayload { sub: string; nickname: string }

const ChangeRequest = z.object({ newEmail: RegisterSchema.shape.email })
const ChangeConfirm = z.object({ newEmail: RegisterSchema.shape.email, otp: z.string().length(6) })
const DeleteRequest = z.object({ email: RegisterSchema.shape.email })
const DeleteConfirm = z.object({ token: z.string().min(10) })

const accountRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const userRepo = new PrismaUserRepository(prisma)
  const email    = new ResendEmailService()

  // ─── POST /auth/email/change-request — send OTP to the NEW email ──────────────
  app.post(
    '/email/change-request',
    {
      config: { rateLimit: { max: 3, timeWindow: '5 minutes' } },
      schema: { body: zodToJsonSchema(ChangeRequest) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const body     = ChangeRequest.parse(request.body)
      const newHash  = hashEmail(body.newEmail)

      if (await userRepo.emailHashExists(newHash)) {
        throw app.httpErrors.conflict('Ese correo ya está en uso.')
      }

      const otp = generateOtp()
      await userRepo.createOtpRequest(newHash, hashToken(otp), new Date(Date.now() + 15 * 60 * 1000))
      email.send(body.newEmail, emailChangeEmail(otp)).catch(() => null)

      return reply.send({ message: 'Código enviado al nuevo correo.' })
    },
  )

  // ─── POST /auth/email/change-confirm ──────────────────────────────────────────
  app.post(
    '/email/change-confirm',
    {
      config: { rateLimit: { max: 5, timeWindow: '5 minutes' } },
      schema: { body: zodToJsonSchema(ChangeConfirm) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user = request.user as JwtPayload
      const body = ChangeConfirm.parse(request.body)
      const newHash = hashEmail(body.newEmail)

      const otpReq = await userRepo.findValidOtpRequest(newHash)
      if (!otpReq || otpReq.attempts >= 5) throw app.httpErrors.badRequest('Código inválido o expirado.')
      if (hashToken(body.otp) !== otpReq.otpHash) {
        await userRepo.incrementOtpAttempts(otpReq.id)
        throw app.httpErrors.badRequest('Código incorrecto.')
      }
      await userRepo.markOtpUsed(otpReq.id)

      if (await userRepo.emailHashExists(newHash)) {
        throw app.httpErrors.conflict('Ese correo ya está en uso.')
      }

      const domain = body.newEmail.split('@')[1] ?? 'unknown.edu'
      await userRepo.updateEmailHash(user.sub, newHash, domain)
      return reply.send({ message: 'Correo actualizado.' })
    },
  )

  // ─── POST /auth/account/delete-request — re-enter email, get confirm link ─────
  app.post(
    '/account/delete-request',
    {
      config: { rateLimit: { max: 3, timeWindow: '10 minutes' } },
      schema: { body: zodToJsonSchema(DeleteRequest) },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user = request.user as JwtPayload
      const body = DeleteRequest.parse(request.body)

      const me = await userRepo.findById(user.sub)
      // Verify the provided email actually belongs to this account
      if (!me || hashEmail(body.email) !== me.emailHash) {
        throw app.httpErrors.badRequest('El correo no coincide con tu cuenta.')
      }

      // Short-lived signed token proves intent at confirm time
      const token = app.jwt.sign({ sub: user.sub, purpose: 'delete' }, { expiresIn: '30m' })
      const base  = process.env.FRONTEND_URL ?? 'https://qhatu.app'
      email.send(body.email, accountDeletionEmail(`${base}/account/delete?t=${token}`)).catch(() => null)

      return reply.send({ message: 'Te enviamos un enlace de confirmación.' })
    },
  )

  // ─── POST /auth/account/delete-confirm — finalize via token (no auth) ─────────
  app.post(
    '/account/delete-confirm',
    {
      config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
      schema: { body: zodToJsonSchema(DeleteConfirm) },
    },
    async (request, reply) => {
      const body = DeleteConfirm.parse(request.body)
      let payload: { sub: string; purpose?: string }
      try {
        payload = app.jwt.verify<{ sub: string; purpose?: string }>(body.token)
      } catch {
        throw app.httpErrors.unauthorized('Enlace inválido o expirado.')
      }
      if (payload.purpose !== 'delete') throw app.httpErrors.badRequest('Token inválido.')

      await userRepo.softDeleteUser(payload.sub)
      reply.clearCookie('qhatu_rt', { path: '/api/auth' })
      return reply.send({ message: 'Cuenta eliminada.' })
    },
  )
}

export default accountRoutes
