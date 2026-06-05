import type { IPostRepository } from '../../domain/ports/IPostRepository'
import type { IUserRepository } from '../../domain/ports/IUserRepository'
import type { IStreamProducer } from '../../domain/ports/IStreamProducer'
import type { IEmbeddingRepository } from '../../domain/ports/IEmbeddingRepository'
import type { Post } from '../../domain/entities/Post'
import { extractHashtags } from '../../infrastructure/services/HashtagExtractor'
import { validateMediaSet, isValidEmbedding } from '@qhatu/shared'

interface CreatePostInput {
  authorId: string
  content: string
  type: 'TEXT' | 'POLL' | 'EPHEMERAL'
  isIdentityRevealed: boolean
  media?: { key: string; type: 'IMAGE' | 'VIDEO' }[]
  embedding?: number[]   // client-computed 384-dim vector (optional)
  poll?: { question: string; options: string[] }
}

export class CreatePostUseCase {
  constructor(
    private readonly postRepo: IPostRepository,
    private readonly userRepo: IUserRepository,
    private readonly stream: IStreamProducer,
    private readonly embeddingRepo: IEmbeddingRepository,
  ) {}

  async execute(input: CreatePostInput): Promise<Post> {
    const { authorId, content, type, isIdentityRevealed, poll, media, embedding } = input

    if (type === 'POLL' && !poll) {
      throw new Error('Los posts de tipo POLL requieren datos de encuesta.')
    }

    // Media + poll mutually exclusive
    if (media && media.length > 0 && poll) {
      throw new Error('Un post no puede tener media y encuesta a la vez.')
    }

    // Enforce media set rules: ≤5 images, ≤1 video, ≤6 total
    if (media && media.length > 0) {
      validateMediaSet(media)
    }

    // Extract + resolve hashtags
    const tags = extractHashtags(content)
    const hashtagIds: string[] = []
    for (const tag of tags) {
      const id = await this.postRepo.findOrCreateHashtag(tag)
      hashtagIds.push(id)
    }

    const expiresAt = type === 'EPHEMERAL'
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : null

    const post = await this.postRepo.create({
      authorId, content, type, isIdentityRevealed, expiresAt, hashtagIds, poll,
      media: media && media.length > 0 ? media : undefined,
    })

    // Store client-computed embedding (384-dim, on-device). Skipped if absent/invalid —
    // such posts simply rank on engagement until they accrue signal. No server ML.
    if (isValidEmbedding(embedding)) {
      this.embeddingRepo.savePostEmbedding(post.id, embedding).catch(() => null)
    }

    const author = await this.userRepo.findById(authorId)

    this.stream.publish({
      type:             'POST_CREATED',
      postId:           post.id,
      userId:           authorId,
      authorId,
      universityDomain: author?.universityDomain ?? '',
      timestamp:        Date.now(),
    }).catch(() => null)

    return post
  }
}
