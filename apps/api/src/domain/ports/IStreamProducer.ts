export type InteractionEventType =
  | 'POST_CREATED'
  | 'REACTION_ADDED'
  | 'REACTION_REMOVED'
  | 'COMMENT_CREATED'
  | 'USER_FOLLOWED'

export interface InteractionEvent {
  type: InteractionEventType
  postId?: string
  userId: string
  authorId?: string
  universityDomain?: string
  reactionType?: string
  timestamp: number
}

export interface IStreamProducer {
  publish(event: InteractionEvent): Promise<void>
}
