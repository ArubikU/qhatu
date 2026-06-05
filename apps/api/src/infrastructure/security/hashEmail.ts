import { createHash } from 'node:crypto'

export function hashEmail(email: string): string {
  const salt = process.env.EMAIL_HASH_SALT ?? ''
  return createHash('sha256').update(email.toLowerCase().trim() + salt).digest('hex')
}
