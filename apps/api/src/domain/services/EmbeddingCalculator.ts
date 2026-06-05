/**
 * EmbeddingCalculator — pure domain service, zero I/O, no external API.
 *
 * Embeddings are now computed CLIENT-SIDE (Transformers.js, all-MiniLM-L6-v2,
 * 384-dim, WebGPU/WASM on the user's device). The server only validates, stores,
 * and operates on those vectors (cosine + EMA). This module therefore exposes:
 *   - cosineSimilarity / normalize / emaUpdate  → used by feed + embedding worker
 *   - embedText (hashed bag-of-words)           → LEGACY fallback, NOT used in the
 *     MiniLM vector space (different distribution). Kept for offline/testing only.
 *
 * EMBEDDING_DIM must match the client model (all-MiniLM-L6-v2 = 384).
 */

export const EMBEDDING_DIM = 384

// Minimal Spanish + English stopword set — keeps vectors topical
const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'y', 'o',
  'que', 'en', 'a', 'con', 'por', 'para', 'es', 'son', 'se', 'su', 'al', 'lo',
  'me', 'mi', 'te', 'tu', 'le', 'mas', 'más', 'pero', 'como', 'ya', 'no', 'si',
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'are', 'it', 'this',
  'that', 'for', 'on', 'with', 'as', 'at', 'be', 'by',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // strip accents
    .split(/[^a-z0-9#]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
}

// FNV-1a hash → bucket in [0, DIM)
function hashToBucket(token: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0) % EMBEDDING_DIM
}

/** Build a unit-normalised 128-dim embedding from text. Empty text → zero vector. */
export function embedText(text: string): number[] {
  const vec = new Array<number>(EMBEDDING_DIM).fill(0)
  const tokens = tokenize(text)
  if (tokens.length === 0) return vec

  for (const tok of tokens) {
    vec[hashToBucket(tok)]! += 1
  }
  return normalize(vec)
}

export function normalize(vec: number[]): number[] {
  let norm = 0
  for (const v of vec) norm += v * v
  norm = Math.sqrt(norm)
  if (norm === 0) return vec
  return vec.map((v) => v / norm)
}

/** Cosine similarity of two unit vectors (= dot product). Returns [0, 1] for non-negative vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += a[i]! * b[i]!
  // Clamp tiny negatives from float error
  return Math.max(0, Math.min(1, dot))
}

/**
 * EMA update of a user's interest vector toward a post embedding.
 * weight scales how much this interaction pulls the vector.
 *   new = normalize(0.9·current + 0.1·weight·postVec)
 */
export function emaUpdate(current: number[], postVec: number[], weight: number): number[] {
  const base = current.length === EMBEDDING_DIM ? current : new Array(EMBEDDING_DIM).fill(0)
  const out  = base.map((c, i) => 0.9 * c + 0.1 * weight * (postVec[i] ?? 0))
  return normalize(out)
}
