// ─── Stream producer singleton (extraído de app.ts para evitar dependencia circular) ───
// Rutas importan streamProducer desde aquí; app.ts ya no lo exporta. Esto permite
// que app.ts sea un builder puro (buildApp) reutilizable en servidor y serverless.
import { getRedis } from './infrastructure/redis/redis'
import { RedisStreamProducer } from './infrastructure/redis/RedisStreamProducer'
import { NullStreamProducer } from './infrastructure/redis/NullStreamProducer'
import type { IStreamProducer } from './domain/ports/IStreamProducer'

const redisClient = getRedis()

// Redis presente → stream real; ausente → Null Object (la API funciona sin Redis).
export const streamProducer: IStreamProducer = redisClient
  ? new RedisStreamProducer(redisClient)
  : new NullStreamProducer()
