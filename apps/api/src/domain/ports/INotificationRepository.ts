export type NotificationType =
  | 'REACTION'
  | 'COMMENT'
  | 'TRENDING'
  | 'RANKING'
  | 'STREAK_MILESTONE'
  | 'NEW_FOLLOWER'

export interface NotificationRecord {
  id: string
  type: NotificationType
  payload: unknown
  read: boolean
  createdAt: Date
}

export interface INotificationRepository {
  create(userId: string, type: NotificationType, payload: object): Promise<NotificationRecord>
  list(userId: string, cursor?: string, limit?: number): Promise<NotificationRecord[]>
  markRead(userId: string, id: string): Promise<void>
  markAllRead(userId: string): Promise<void>
  unreadCount(userId: string): Promise<number>

  // Push subscriptions
  savePushSubscription(userId: string, subscriptionJson: string): Promise<void>
  getPushSubscriptions(userId: string): Promise<{ id: string; subscription: string }[]>
  deletePushSubscription(id: string): Promise<void>
}
