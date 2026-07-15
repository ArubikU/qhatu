import { createHash } from 'node:crypto'

// ─── Salt vacío hace los hashes predecibles — lanzar error si no está definido ───
export function hashEmail(email: string): string {
  const salt = process.env.EMAIL_HASH_SALT
  if (!salt) throw new Error('EMAIL_HASH_SALT must be set')
  return createHash('sha256').update(email.toLowerCase().trim() + salt).digest('hex')
}
