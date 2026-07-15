import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import sensible from '@fastify/sensible'
import rateLimit from '@fastify/rate-limit'
import authRoutes from './routes/auth'
import qrRoutes from './routes/qr'
import accountRoutes from './routes/account'
import postRoutes from './routes/posts'
import socialRoutes from './routes/social'
import userRoutes from './routes/users'
import streamRoutes from './routes/stream'
import mediaRoutes from './routes/media'
import searchRoutes from './routes/search'
import notificationRoutes from './routes/notifications'
import rewardRoutes from './routes/rewards'
import rankingRoutes from './routes/rankings'
import trendsRoutes from './routes/trends'

// streamProducer vive en su propio módulo (src/streamProducer.ts) para que las rutas
// no dependan de app.ts. Se re-exporta aquí por compatibilidad histórica.
export { streamProducer } from './streamProducer'

// ─── Validación de secrets en producción ──────────────────────────────────────
function assertProdSecrets() {
  if (process.env.NODE_ENV !== 'production') return
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters in production')
  }
  if (!process.env.COOKIE_SECRET || process.env.COOKIE_SECRET.length < 32) {
    throw new Error('COOKIE_SECRET must be set and at least 32 characters in production')
  }
  if (!process.env.EMAIL_HASH_SALT) {
    throw new Error('EMAIL_HASH_SALT must be set in production')
  }
}

// ─── Builder puro: construye y devuelve la app SIN escuchar puerto ni arrancar workers ───
// Reutilizable por src/server.ts (long-running) y api/index.ts (Vercel serverless).
export async function buildApp(): Promise<FastifyInstance> {
  assertProdSecrets()

  const app = Fastify({ logger: true, ignoreTrailingSlash: true })

  // ─── CORS: en producción exige FRONTEND_URL, en dev usa localhost ───
  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? (process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('FRONTEND_URL must be set in production') })()
      : 'http://localhost:3000'),
    credentials: true,
  })
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET ?? process.env.JWT_SECRET ?? 'cookie-secret-change-in-production',
  })
  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  })
  await app.register(sensible)
  // Rate limiting — global: false so each route sets its own limits
  await app.register(rateLimit, { global: false })

  // ─── Routes ───────────────────────────────────────────────────────────────
  await app.register(authRoutes,          { prefix: '/auth' })
  await app.register(qrRoutes,            { prefix: '/auth/qr' })
  await app.register(accountRoutes,       { prefix: '/auth' })
  await app.register(postRoutes,          { prefix: '/posts' })
  await app.register(socialRoutes,        { prefix: '/social' })
  await app.register(userRoutes,          { prefix: '/users' })
  await app.register(streamRoutes,        { prefix: '/stream' })
  await app.register(mediaRoutes,         { prefix: '/media' })
  await app.register(searchRoutes,        { prefix: '/search' })
  await app.register(notificationRoutes,  { prefix: '/notifications' })
  await app.register(rewardRoutes,        { prefix: '/rewards' })
  await app.register(rankingRoutes,       { prefix: '/rankings' })
  await app.register(trendsRoutes,        { prefix: '/trends' })

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    redis: !!process.env.REDIS_URL,
  }))
  app.get('/', async () => ({ message: 'Qhatu API v1', docs: '/health' }))

  return app
}
