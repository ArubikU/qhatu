import type { IPostRepository } from '../../domain/ports/IPostRepository'
import type { IStreamProducer } from '../../domain/ports/IStreamProducer'
import type { Comment } from '../../domain/entities/Comment'

interface CreateCommentInput {
  postId: string
  authorId: string
  content: string
}

export class CreateCommentUseCase {
  constructor(
    private readonly postRepo: IPostRepository,
    private readonly stream: IStreamProducer,
  ) {}

  async execute(input: CreateCommentInput): Promise<Comment> {
    const { postId, authorId, content } = input

    const post = await this.postRepo.findById(postId)
    if (!post) throw new Error('Post no encontrado.')

    const comment = await this.postRepo.createComment(postId, authorId, content)

    this.stream.publish({
      type:      'COMMENT_CREATED',
      postId,
      userId:    authorId,
      authorId:  post.authorId,
      timestamp: Date.now(),
    }).catch(() => null)

    return comment
  }
}
