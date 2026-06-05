import type { IPostRepository, ReactionType } from '../../domain/ports/IPostRepository'
import type { IStreamProducer } from '../../domain/ports/IStreamProducer'

interface ToggleReactionInput {
  postId: string
  userId: string
  type: ReactionType
}

interface ToggleReactionOutput {
  action: 'added' | 'removed'
}

export class ToggleReactionUseCase {
  constructor(
    private readonly postRepo: IPostRepository,
    private readonly stream: IStreamProducer,
  ) {}

  async execute(input: ToggleReactionInput): Promise<ToggleReactionOutput> {
    const { postId, userId, type } = input

    const post = await this.postRepo.findById(postId)
    if (!post) throw new Error('Post no encontrado.')

    const existing = await this.postRepo.findReaction(postId, userId, type)
    let action: 'added' | 'removed'

    if (existing) {
      await this.postRepo.removeReaction(existing.id, postId, type)
      action = 'removed'
    } else {
      await this.postRepo.addReaction(postId, userId, type)
      action = 'added'
    }

    this.stream.publish({
      type:         action === 'added' ? 'REACTION_ADDED' : 'REACTION_REMOVED',
      postId,
      userId,
      authorId:     post.authorId,
      reactionType: type,
      timestamp:    Date.now(),
    }).catch(() => null)

    return { action }
  }
}
