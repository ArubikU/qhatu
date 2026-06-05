import { createHash, randomBytes } from 'node:crypto'

export function hashToken(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function generateOtp(): string {
  // 6-digit cryptographically random OTP
  const buf = randomBytes(3)
  return String(parseInt(buf.toString('hex'), 16) % 1_000_000).padStart(6, '0')
}

export function generateRefreshToken(): string {
  return randomBytes(40).toString('hex')
}
