import type { IPostRepository } from '../../domain/ports/IPostRepository'

// ─── GetPostUseCase: obtiene un post público por ID sin exponer el authorId ───
export class GetPostUseCase {
  constructor(private readonly postRepo: IPostRepository) {}

  async execute(id: string): Promise<Record<string, unknown> | null> {
    const post = await this.postRepo.getPublicPost(id)
    if (!post) return null

    // ─── authorId nunca se expone al cliente — mantiene el anonimato ───
    const { authorId: _drop, ...publicPost } = post
    return publicPost
  }
}