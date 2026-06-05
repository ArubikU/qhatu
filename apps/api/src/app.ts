import Fastify from 'fastify'
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
import { setupWorkers } from './infrastructure/workers/setupWorkers'
import { ensureSearchIndexes } from './infrastructure/db/ensureSearchIndexes'
import { startRankingsCron } from './infrastructure/cron/rankingsCron'
import { getRedis } from './infrastructure/redis/redis'
import { RedisStreamProducer } from './infrastructure/redis/RedisStreamProducer'
import { NullStreamProducer } from './infrastructure/redis/NullStreamProducer'
import type { IStreamProducer } from './domain/ports/IStreamProducer'

const app = Fastify({ logger: true, ignoreTrailingSlash: true })

// ─── Stream producer (shared singleton, injected into routes) ─────────────────
const redisClient  = getRedis()
export const streamProducer: IStreamProducer = redisClient
  ? new RedisStreamProducer(redisClient)
  : new NullStreamProducer()

// ─── Plugins ──────────────────────────────────────────────────────────────────
await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
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

// ─── Routes ───────────────────────────────────────────────────────────────────
await app.register(authRoutes,   { prefix: '/auth' })
await app.register(qrRoutes,     { prefix: '/auth/qr' })
await app.register(accountRoutes, { prefix: '/auth' })
await app.register(postRoutes,   { prefix: '/posts' })
await app.register(socialRoutes, { prefix: '/social' })
await app.register(userRoutes,   { prefix: '/users' })
await app.register(streamRoutes,       { prefix: '/stream' })
await app.register(mediaRoutes,        { prefix: '/media' })
await app.register(searchRoutes,       { prefix: '/search' })
await app.register(notificationRoutes, { prefix: '/notifications' })
await app.register(rewardRoutes,        { prefix: '/rewards' })
await app.register(rankingRoutes,       { prefix: '/rankings' })
await app.register(trendsRoutes,        { prefix: '/trends' })

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  redis: !!process.env.REDIS_URL,
}))

app.get('/', async () => ({ message: 'Qhatu API v1', docs: '/health' }))

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3002)
try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`API running on http://localhost:${PORT}`)

  // Ensure full-text + trigram search indexes exist (idempotent)
  await ensureSearchIndexes()

  // Start background workers (non-blocking — skips if no REDIS_URL)
  await setupWorkers()

  // Daily rankings cron (+ initial compute)
  startRankingsCron()
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
