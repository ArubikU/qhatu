import { z } from 'zod'

// Embedding dimension. Must match the client model output (all-MiniLM-L6-v2 → 384).
// Client computes the vector on-device (WebGPU/WASM); server only validates + stores.
export const EMBEDDING_DIM = 384

// Model id used by the in-browser embedder. Pinned so all clients share one vector space.
export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'

export const EmbeddingSchema = z
  .array(z.number().finite())
  .length(EMBEDDING_DIM)

export type Embedding = z.infer<typeof EmbeddingSchema>

/** True if vector is the right length and finite — cheap guard before storing. */
export function isValidEmbedding(v: unknown): v is number[] {
  return Array.isArray(v) && v.length === EMBEDDING_DIM && v.every((n) => typeof n === 'number' && Number.isFinite(n))
}
