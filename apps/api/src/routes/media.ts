import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { z } from 'zod'
import { PresignUploadSchema } from '@qhatu/shared'
import { S3StorageService } from '../infrastructure/storage/S3StorageService'
import { PresignUploadUseCase } from '../application/media/PresignUploadUseCase'

interface JwtPayload { sub: string; nickname: string }

const mediaRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const storage = new S3StorageService()

  // ─── POST /media/presign ────────────────────────────────────────────────────
  // Returns a presigned PUT URL so the client uploads the file directly to
  // S3/B2 — the API never streams the bytes. Size + mime enforced server-side.
  app.post(
    '/presign',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: {
        body: zodToJsonSchema(PresignUploadSchema),
        response: {
          200: zodToJsonSchema(z.object({
            uploadUrl: z.string(),
            key:       z.string(),
            expiresIn: z.number(),
            mediaType: z.enum(['IMAGE', 'VIDEO']),
          })),
        },
      },
    },
    async (request, reply) => {
      await request.jwtVerify()
      const user = request.user as JwtPayload
      const body = PresignUploadSchema.parse(request.body)

      const useCase = new PresignUploadUseCase(storage)
      try {
        const result = await useCase.execute({
          userId:      user.sub,
          contentType: body.contentType,
          size:        body.size,
        })
        return reply.send(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al preparar la subida'
        if (message.includes('no configurado')) throw app.httpErrors.serviceUnavailable(message)
        throw app.httpErrors.badRequest(message)
      }
    },
  )

  // ─── GET /media/config ──────────────────────────────────────────────────────
  // Lets the frontend know whether uploads are enabled (hide the button if not).
  app.get(
    '/config',
    { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (_request, reply) => {
      return reply.send({ enabled: storage.isConfigured() })
    },
  )
}

export default mediaRoutes
