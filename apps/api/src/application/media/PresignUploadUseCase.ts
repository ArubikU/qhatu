import { randomBytes } from 'crypto'
import type { IStorageService, PresignedUpload } from '../../domain/ports/IStorageService'
import { validateUpload, mimeToKind, MEDIA_LIMITS } from '@qhatu/shared'

interface PresignInput {
  userId: string
  contentType: string
  size: number
}

export class PresignUploadUseCase {
  constructor(private readonly storage: IStorageService) {}

  async execute(input: PresignInput): Promise<PresignedUpload & { mediaType: 'IMAGE' | 'VIDEO' }> {
    if (!this.storage.isConfigured()) {
      throw new Error('Almacenamiento de medios no configurado.')
    }

    // Validate against shared limits (mime + size) — throws user-facing message
    const kind = validateUpload(input.contentType, input.size)

    // Build a collision-resistant key. Namespace by kind + date for easy lifecycle rules.
    const ext   = extForMime(input.contentType, kind)
    const today = new Date().toISOString().slice(0, 10)  // YYYY-MM-DD
    const rand  = randomBytes(16).toString('hex')
    const key   = `${kind}/${today}/${rand}.${ext}`

    const presigned = await this.storage.presignUpload({
      key,
      contentType: input.contentType,
    })

    // Note: no publicUrl returned — private buckets have none. The client stores
    // the `key` and the server resolves it to a (possibly presigned) URL at read time.
    return {
      ...presigned,
      mediaType: kind === 'image' ? 'IMAGE' : 'VIDEO',
    }
  }
}

function extForMime(mime: string, kind: 'image' | 'video'): string {
  const map: Record<string, string> = {
    'image/jpeg':      'jpg',
    'image/png':       'png',
    'image/webp':      'webp',
    'image/gif':       'gif',
    'video/mp4':       'mp4',
    'video/webm':      'webm',
    'video/quicktime': 'mov',
  }
  return map[mime] ?? MEDIA_LIMITS[kind].extensions[0]
}
