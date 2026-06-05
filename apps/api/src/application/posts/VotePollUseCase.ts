import type { IPostRepository } from '../../domain/ports/IPostRepository'

interface VotePollInput {
  postId: string
  optionId: string
  userId: string
}

export class VotePollUseCase {
  constructor(private readonly postRepo: IPostRepository) {}

  async execute(input: VotePollInput): Promise<void> {
    const post = await this.postRepo.findById(input.postId)
    if (!post) throw new Error('Post no encontrado.')
    if (post.type !== 'POLL') throw new Error('Este post no es una encuesta.')
    await this.postRepo.votePoll(input.postId, input.optionId, input.userId)
  }
}
