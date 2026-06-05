import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { IStorageService, PresignedUpload } from '../../domain/ports/IStorageService'
import { loadStorageConfig, type StorageConfig } from './storageConfig'

/**
 * S3-compatible storage. Works with:
 *  - AWS S3        (no endpoint, forcePathStyle=false)
 *  - Backblaze B2  (endpoint=https://s3.<region>.backblazeb2.com, forcePathStyle=true)
 *  - Cloudflare R2 (endpoint=https://<account>.r2.cloudflarestorage.com)
 *  - MinIO         (endpoint=http://localhost:9000, forcePathStyle=true)
 *
 * Supports both PUBLIC and PRIVATE buckets:
 *  - public  → resolveUrl concatenates the public base URL
 *  - private → resolveUrl returns a time-limited presigned GET URL
 */
export class S3StorageService implements IStorageService {
  private readonly config: StorageConfig | null
  private readonly client: S3Client | null

  constructor() {
    this.config = loadStorageConfig()
    this.client = this.config
      ? new S3Client({
          endpoint:        this.config.endpoint,
          region:          this.config.region,
          forcePathStyle:  this.config.forcePathStyle,
          credentials: {
            accessKeyId:     this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey,
          },
        })
      : null
  }

  isConfigured(): boolean {
    return this.client !== null
  }

  isPrivate(): boolean {
    return this.config?.isPrivate ?? false
  }

  async presignUpload(params: { key: string; contentType: string }): Promise<PresignedUpload> {
    if (!this.client || !this.config) throw new Error('Almacenamiento de medios no configurado.')

    const command = new PutObjectCommand({
      Bucket:      this.config.bucket,
      Key:         params.key,
      ContentType: params.contentType,
    })
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: this.config.presignExpiry,
    })

    return { uploadUrl, key: params.key, expiresIn: this.config.presignExpiry }
  }

  async resolveUrl(key: string): Promise<string> {
    // Passthrough for external URLs (e.g. seeded Twitter media — not in our bucket)
    if (/^https?:\/\//i.test(key)) return key
    if (!this.client || !this.config) throw new Error('Almacenamiento de medios no configurado.')

    // Private bucket → presigned GET URL (time-limited)
    if (this.config.isPrivate) {
      const command = new GetObjectCommand({ Bucket: this.config.bucket, Key: key })
      return getSignedUrl(this.client, command, { expiresIn: this.config.readExpiry })
    }

    // Public bucket → static URL
    return this.config.publicUrl
      ? `${this.config.publicUrl}/${key}`
      : this.derivePublicUrl(key)
  }

  private derivePublicUrl(key: string): string {
    const { endpoint, bucket, region, forcePathStyle } = this.config!
    if (endpoint) {
      const base = endpoint.replace(/\/$/, '')
      return forcePathStyle ? `${base}/${bucket}/${key}` : `${base}/${key}`
    }
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
  }
}
