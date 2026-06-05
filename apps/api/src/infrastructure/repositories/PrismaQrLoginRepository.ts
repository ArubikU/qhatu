import type { PrismaClient } from '@prisma/client'
import type { IQrLoginRepository, QrSession, QrStatus } from '../../domain/ports/IQrLoginRepository'

export class PrismaQrLoginRepository implements IQrLoginRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(expiresAt: Date): Promise<QrSession> {
    const rec = await this.db.qrLoginSession.create({ data: { expiresAt } })
    return toDomain(rec)
  }

  async findById(id: string): Promise<QrSession | null> {
    const rec = await this.db.qrLoginSession.findUnique({ where: { id } })
    return rec ? toDomain(rec) : null
  }

  async setApproved(id: string, userId: string): Promise<void> {
    await this.db.qrLoginSession.update({ where: { id }, data: { status: 'APPROVED', approvedUserId: userId } })
  }

  async setStatus(id: string, status: QrStatus): Promise<void> {
    await this.db.qrLoginSession.update({ where: { id }, data: { status } })
  }
}

function toDomain(r: { id: string; status: string; approvedUserId: string | null; expiresAt: Date }): QrSession {
  return { id: r.id, status: r.status as QrSession['status'], approvedUserId: r.approvedUserId, expiresAt: r.expiresAt }
}
