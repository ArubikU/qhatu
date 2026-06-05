export interface StorageConfig {
  endpoint?: string        // empty = AWS default; set for B2/R2/MinIO
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  publicUrl: string        // base URL files are served from (public buckets only)
  forcePathStyle: boolean  // true for B2/MinIO, false for AWS/R2 virtual-hosted
  isPrivate: boolean       // private bucket → reads need presigned GET URLs
  presignExpiry: number    // seconds — upload PUT URL validity
  readExpiry: number       // seconds — presigned GET URL validity (private only)
}

/** Read storage config from env. Returns null if not configured. */
export function loadStorageConfig(): StorageConfig | null {
  const bucket          = process.env.STORAGE_BUCKET
  const accessKeyId     = process.env.STORAGE_ACCESS_KEY_ID
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY

  // Minimum required to function
  if (!bucket || !accessKeyId || !secretAccessKey) return null

  return {
    endpoint:        process.env.STORAGE_ENDPOINT || undefined,
    region:          process.env.STORAGE_REGION || 'us-east-1',
    bucket,
    accessKeyId,
    secretAccessKey,
    publicUrl:       (process.env.STORAGE_PUBLIC_URL || '').replace(/\/$/, ''),
    forcePathStyle:  process.env.STORAGE_FORCE_PATH_STYLE === 'true',
    isPrivate:       process.env.STORAGE_PRIVATE === 'true',
    presignExpiry:   Number(process.env.STORAGE_PRESIGN_EXPIRY ?? 300),
    readExpiry:      Number(process.env.STORAGE_READ_EXPIRY ?? 3600),
  }
}
