import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { getSubRedis } from '../infrastructure/redis/redis'

interface JwtPayload { sub: string; nickname: string }

// In-memory pub/sub for when Redis is not available (dev mode)
const devListeners = new Map<string, Set<(domain: string) => void>>()

export function notifyNewPost(universityDomain: string) {
  const listeners = devListeners.get(universityDomain)
  if (listeners) {
    for (const fn of listeners) fn(universityDomain)
  }
  // Also notify wildcard listeners
  const wild = devListeners.get('*')
  if (wild) for (const fn of wild) fn(universityDomain)
}

const streamRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  /**
   * GET /stream
   * Server-Sent Events — client connects and receives:
   *   { type: "NEW_POSTS", universityDomain: string }  when new posts appear
   *   { type: "ping" }  every 30s keepalive
   *
   * Client shows "N posts nuevos — tap para cargar" banner.
   */
  app.get(
    '/',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      // EventSource can't set Authorization header — accept token via query param
      const query = request.query as { _at?: string }
      if (query._at) {
        try {
          request.headers.authorization = `Bearer ${query._at}`
        } catch {}
      }
      await request.jwtVerify()
      const user = request.user as JwtPayload

      // Fetch viewer's university domain
      const { prisma }   = await import('../infrastructure/db/prisma')
      const viewer       = await prisma.user.findUnique({
        where:  { id: user.sub },
        select: { universityDomain: true },
      })
      const domain = viewer?.universityDomain ?? '*'

      // SSE headers
      reply.raw.writeHead(200, {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
        'X-Accel-Buffering': 'no',  // disable nginx buffering
      })

      const send = (data: object) => {
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`)
      }

      send({ type: 'connected' })

      // Keepalive ping every 30s
      const pingInterval = setInterval(() => {
        send({ type: 'ping' })
      }, 30_000)

      const redisClient = getSubRedis()
      const channel     = `feed:updates:${domain}`

      if (redisClient) {
        // Subscribe to Redis pub/sub channel
        await redisClient.subscribe(channel)
        redisClient.on('message', (ch, message) => {
          if (ch === channel) {
            send(JSON.parse(message))
          }
        })
      } else {
        // Dev mode: use in-memory listeners
        const listener = (d: string) => send({ type: 'NEW_POSTS', universityDomain: d })
        if (!devListeners.has(domain)) devListeners.set(domain, new Set())
        devListeners.get(domain)!.add(listener)

        request.raw.on('close', () => {
          devListeners.get(domain)?.delete(listener)
        })
      }

      // Clean up on disconnect
      request.raw.on('close', () => {
        clearInterval(pingInterval)
        if (redisClient) {
          redisClient.unsubscribe(channel).catch(() => null)
        }
      })

      // Keep connection open — Fastify won't send a response
      return reply
    },
  )
}

export default streamRoutes
