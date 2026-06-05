import type { IStreamProducer, InteractionEvent } from '../../domain/ports/IStreamProducer'

/** No-op producer used when Redis is not configured (dev without Redis). */
export class NullStreamProducer implements IStreamProducer {
  async publish(_event: InteractionEvent): Promise<void> {
    // intentional no-op
  }
}
