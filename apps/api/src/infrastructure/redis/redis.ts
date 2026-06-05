import Redis from 'ioredis'

let _redis: Redis | null = null
let _subRedis: Redis | null = null  // separate connection for pub/sub

function createClient(): Redis {
  const url = process.env.REDIS_URL
  if (!url) throw new Error('REDIS_URL not configured')

  const client = new Redis(url, {
    maxRetriesPerRequest: null, // required for BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
  })

  client.on('error', (err) => {
    // Swallow connection errors in dev — Redis is optional
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Redis] connection error (non-fatal in dev):', err.message)
    }
  })

  return client
}

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null
  if (!_redis) _redis = createClient()
  return _redis
}

export function getSubRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null
  if (!_subRedis) _subRedis = createClient()
  return _subRedis
}

// For BullMQ — needs a fresh connection per queue
export function newRedisConnection(): Redis {
  const url = process.env.REDIS_URL
  if (!url) throw new Error('REDIS_URL not configured')
  return new Redis(url, { maxRetriesPerRequest: null, enableReadyCheck: false })
}
