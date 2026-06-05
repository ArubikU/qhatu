export type QrStatus = 'PENDING' | 'APPROVED' | 'CONSUMED' | 'EXPIRED'

export interface QrSession {
  id: string
  status: QrStatus
  approvedUserId: string | null
  expiresAt: Date
}

export interface IQrLoginRepository {
  create(expiresAt: Date): Promise<QrSession>
  findById(id: string): Promise<QrSession | null>
  setApproved(id: string, userId: string): Promise<void>
  setStatus(id: string, status: QrStatus): Promise<void>
}
