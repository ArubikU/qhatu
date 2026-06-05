import type { IQrLoginRepository, QrStatus } from '../../domain/ports/IQrLoginRepository'

const TTL_MS = 2 * 60 * 1000  // 2 minutes — short by design (rotation)

export class QrLoginService {
  constructor(private readonly repo: IQrLoginRepository) {}

  async create(): Promise<{ sessionId: string; expiresAt: string }> {
    const session = await this.repo.create(new Date(Date.now() + TTL_MS))
    return { sessionId: session.id, expiresAt: session.expiresAt.toISOString() }
  }

  /** Public status — expires lazily. */
  async status(sessionId: string): Promise<QrStatus> {
    const s = await this.repo.findById(sessionId)
    if (!s) return 'EXPIRED'
    if (s.status === 'PENDING' && s.expiresAt < new Date()) {
      await this.repo.setStatus(s.id, 'EXPIRED')
      return 'EXPIRED'
    }
    return s.status
  }

  /** Logged-in device approves the session. */
  async approve(sessionId: string, userId: string): Promise<void> {
    const s = await this.repo.findById(sessionId)
    if (!s) throw new Error('Sesión QR no encontrada.')
    if (s.expiresAt < new Date()) {
      await this.repo.setStatus(s.id, 'EXPIRED')
      throw new Error('El código QR expiró. Genera uno nuevo.')
    }
    if (s.status !== 'PENDING') throw new Error('Este código QR ya no es válido.')
    await this.repo.setApproved(s.id, userId)
  }

  /** Desktop claims tokens once approved. Single-use → marks CONSUMED. */
  async claim(sessionId: string): Promise<string | null> {
    const s = await this.repo.findById(sessionId)
    if (!s) return null
    if (s.expiresAt < new Date()) {
      await this.repo.setStatus(s.id, 'EXPIRED')
      return null
    }
    if (s.status !== 'APPROVED' || !s.approvedUserId) return null
    await this.repo.setStatus(s.id, 'CONSUMED')
    return s.approvedUserId
  }
}
