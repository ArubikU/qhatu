import type { IPostRepository } from '../../domain/ports/IPostRepository'

interface DeletePostInput {
  postId: string
  requesterId: string
}

export class DeletePostUseCase {
  constructor(private readonly postRepo: IPostRepository) {}

  async execute(input: DeletePostInput): Promise<void> {
    const { postId, requesterId } = input

    const post = await this.postRepo.findById(postId)
    if (!post) throw new Error('Post no encontrado.')
    if (post.authorId !== requesterId) throw new Error('No tienes permiso para eliminar este post.')

    await this.postRepo.softDelete(postId)
  }
}
