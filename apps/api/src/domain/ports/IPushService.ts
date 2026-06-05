export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

export type PushResult = 'sent' | 'expired' | 'error'

export interface IPushService {
  isConfigured(): boolean
  /** Send a push. Returns 'expired' if the subscription is gone (410/404) → caller should delete it. */
  send(subscriptionJson: string, payload: PushPayload): Promise<PushResult>
}
