export interface PresignedUpload {
  /** Presigned PUT URL — client uploads file directly here */
  uploadUrl: string
  /** Object key in the bucket */
  key: string
  /** Seconds until uploadUrl expires */
  expiresIn: number
}

export interface IStorageService {
  /** Whether storage is configured (env present) */
  isConfigured(): boolean
  /** Whether the bucket is private (reads require presigned GET URLs) */
  isPrivate(): boolean
  /** Generate a presigned PUT URL for direct client upload */
  presignUpload(params: { key: string; contentType: string }): Promise<PresignedUpload>
  /**
   * Resolve a stored object key to a readable URL.
   *  - public bucket  → public base URL + key (no signing, cacheable)
   *  - private bucket → presigned GET URL (time-limited)
   */
  resolveUrl(key: string): Promise<string>
}
