import webpush from 'web-push'
import type { IPushService, PushPayload, PushResult } from '../../domain/ports/IPushService'

export class WebPushService implements IPushService {
  private readonly configured: boolean

  constructor() {
    const pub  = process.env.VAPID_PUBLIC_KEY
    const priv = process.env.VAPID_PRIVATE_KEY
    const subj = process.env.VAPID_SUBJECT ?? 'mailto:noreply@qhatu.app'

    this.configured = !!pub && !!priv
    if (this.configured) {
      webpush.setVapidDetails(subj, pub!, priv!)
    }
  }

  isConfigured(): boolean {
    return this.configured
  }

  async send(subscriptionJson: string, payload: PushPayload): Promise<PushResult> {
    if (!this.configured) return 'error'
    try {
      const subscription = JSON.parse(subscriptionJson) as webpush.PushSubscription
      await webpush.sendNotification(subscription, JSON.stringify(payload))
      return 'sent'
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode
      // 410 Gone / 404 Not Found → subscription expired
      if (statusCode === 410 || statusCode === 404) return 'expired'
      return 'error'
    }
  }
}
