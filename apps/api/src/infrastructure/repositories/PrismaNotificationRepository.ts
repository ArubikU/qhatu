import type { PrismaClient, Prisma } from '@prisma/client'
import type {
  INotificationRepository,
  NotificationRecord,
  NotificationType,
} from '../../domain/ports/INotificationRepository'

export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(userId: string, type: NotificationType, payload: object): Promise<NotificationRecord> {
    const rec = await this.db.notification.create({
      data: { userId, type, payload: payload as Prisma.InputJsonValue },
    })
    return { id: rec.id, type: rec.type as NotificationType, payload: rec.payload, read: rec.read, createdAt: rec.createdAt }
  }

  async list(userId: string, cursor?: string, limit = 20): Promise<NotificationRecord[]> {
    const where: Prisma.NotificationWhereInput = { userId }
    if (cursor) {
      const pivot = await this.db.notification.findUnique({ where: { id: cursor }, select: { createdAt: true } })
      if (pivot) (where as Prisma.NotificationWhereInput).createdAt = { lt: pivot.createdAt }
    }
    const rows = await this.db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return rows.map((r) => ({ id: r.id, type: r.type as NotificationType, payload: r.payload, read: r.read, createdAt: r.createdAt }))
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.db.notification.updateMany({ where: { id, userId }, data: { read: true } })
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
  }

  async unreadCount(userId: string): Promise<number> {
    return this.db.notification.count({ where: { userId, read: false } })
  }

  // ─── Push subscriptions ────────────────────────────────────────────────────

  async savePushSubscription(userId: string, subscriptionJson: string): Promise<void> {
    // Dedup by exact subscription payload for this user
    const existing = await this.db.pushToken.findFirst({ where: { userId, subscription: subscriptionJson } })
    if (existing) return
    await this.db.pushToken.create({ data: { userId, subscription: subscriptionJson } })
  }

  async getPushSubscriptions(userId: string): Promise<{ id: string; subscription: string }[]> {
    return this.db.pushToken.findMany({ where: { userId }, select: { id: true, subscription: true } })
  }

  async deletePushSubscription(id: string): Promise<void> {
    await this.db.pushToken.delete({ where: { id } }).catch(() => null)
  }
}
