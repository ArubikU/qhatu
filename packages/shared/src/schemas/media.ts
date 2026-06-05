import { z } from 'zod'

// ─── Upload limits — single source of truth, used by FE (pre-validate) + BE (enforce) ──

export const MEDIA_LIMITS = {
  maxImages: 5,   // up to 5 images per post
  maxVideos: 1,   // up to 1 video per post
  maxItems:  6,   // hard ceiling (5 images + 1 video)
  image: {
    maxBytes:    5 * 1024 * 1024,   // 5 MB
    mimeTypes:   ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
    extensions:  ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const,
  },
  video: {
    maxBytes:    50 * 1024 * 1024,  // 50 MB
    mimeTypes:   ['video/mp4', 'video/webm', 'video/quicktime'] as const,
    extensions:  ['mp4', 'webm', 'mov'] as const,
  },
} as const

export type MediaKind = 'image' | 'video'
export type MediaType = 'IMAGE' | 'VIDEO'

// Map a mime type to its kind, or null if unsupported
export function mimeToKind(mime: string): MediaKind | null {
  if ((MEDIA_LIMITS.image.mimeTypes as readonly string[]).includes(mime)) return 'image'
  if ((MEDIA_LIMITS.video.mimeTypes as readonly string[]).includes(mime)) return 'video'
  return null
}

export function kindToType(kind: MediaKind): MediaType {
  return kind === 'image' ? 'IMAGE' : 'VIDEO'
}

// ─── Presign request ────────────────────────────────────────────────────────

export const PresignUploadSchema = z.object({
  contentType: z.string().min(1),
  size:        z.number().int().positive(),
})
export type PresignUpload = z.infer<typeof PresignUploadSchema>

/**
 * Validate a single file against per-file limits (mime + size).
 * Returns the resolved kind, or throws a user-facing message.
 */
export function validateUpload(contentType: string, size: number): MediaKind {
  const kind = mimeToKind(contentType)
  if (!kind) throw new Error(`Tipo de archivo no permitido: ${contentType}`)
  const limit = MEDIA_LIMITS[kind]
  if (size > limit.maxBytes) {
    const mb = (limit.maxBytes / 1024 / 1024).toFixed(0)
    throw new Error(`Archivo demasiado grande. Máximo ${mb} MB para ${kind === 'image' ? 'imágenes' : 'videos'}.`)
  }
  return kind
}

// ─── Media set (a post's attached media) ──────────────────────────────────────

export const MediaItemSchema = z.object({
  key:  z.string().min(1),
  type: z.enum(['IMAGE', 'VIDEO']),
})
export type MediaItemInput = z.infer<typeof MediaItemSchema>

/**
 * Validate the whole media set attached to a post.
 * Rules: ≤5 images, ≤1 video, ≤6 total.
 */
export function validateMediaSet(items: { type: MediaType }[]): void {
  if (items.length === 0) return
  if (items.length > MEDIA_LIMITS.maxItems) {
    throw new Error(`Máximo ${MEDIA_LIMITS.maxItems} archivos por post.`)
  }
  const images = items.filter((i) => i.type === 'IMAGE').length
  const videos = items.filter((i) => i.type === 'VIDEO').length
  if (images > MEDIA_LIMITS.maxImages) {
    throw new Error(`Máximo ${MEDIA_LIMITS.maxImages} imágenes por post.`)
  }
  if (videos > MEDIA_LIMITS.maxVideos) {
    throw new Error(`Máximo ${MEDIA_LIMITS.maxVideos} video por post.`)
  }
}

/** Can another file of this kind be added to the current set? (FE helper) */
export function canAddMedia(current: { type: MediaType }[], kind: MediaKind): boolean {
  if (current.length >= MEDIA_LIMITS.maxItems) return false
  if (kind === 'image') return current.filter((i) => i.type === 'IMAGE').length < MEDIA_LIMITS.maxImages
  return current.filter((i) => i.type === 'VIDEO').length < MEDIA_LIMITS.maxVideos
}
