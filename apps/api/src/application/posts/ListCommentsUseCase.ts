import type { IPostRepository } from '../../domain/ports/IPostRepository'

interface CommentWithAuthor {
  id: string
  postId: string
  authorNickname: string
  content: string
  createdAt: Date
}

interface ListCommentsInput {
  postId: string
  cursor?: string
  limit?: number
}

interface ListCommentsOutput {
  comments: CommentWithAuthor[]
  nextCursor: string | null
}

export class ListCommentsUseCase {
  constructor(private readonly postRepo: IPostRepository) {}

  async execute(input: ListCommentsInput): Promise<ListCommentsOutput> {
    const limit = input.limit ?? 20

    const comments = await this.postRepo.listComments(input.postId, input.cursor, limit + 1)
    const hasMore  = comments.length > limit
    const page     = hasMore ? comments.slice(0, limit) : comments

    const withAuthors = await Promise.all(
      page.map(async (c) => ({
        id:             c.id,
        postId:         c.postId,
        authorNickname: await this.postRepo.getCommentAuthorNickname(c.authorId),
        content:        c.content,
        createdAt:      c.createdAt,
      })),
    )

    return {
      comments:   withAuthors,
      nextCursor: hasMore ? page[page.length - 1]!.id : null,
    }
  }
}
