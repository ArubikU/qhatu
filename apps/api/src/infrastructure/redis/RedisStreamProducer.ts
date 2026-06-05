import type { Redis } from 'ioredis'
import type { IStreamProducer, InteractionEvent } from '../../domain/ports/IStreamProducer'

const STREAM_KEY = 'qhatu:interactions'

export class RedisStreamProducer implements IStreamProducer {
  constructor(private readonly redis: Redis) {}

  async publish(event: InteractionEvent): Promise<void> {
    // xadd STREAM_KEY * field1 value1 field2 value2 ...
    const fields: string[] = []
    for (const [k, v] of Object.entries(event)) {
      if (v !== undefined) {
        fields.push(k, String(v))
      }
    }
    await this.redis.xadd(STREAM_KEY, '*', ...fields)
  }
}
