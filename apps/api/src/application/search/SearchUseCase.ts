import type { ISearchRepository } from '../../domain/ports/ISearchRepository'
import type { IUserRepository } from '../../domain/ports/IUserRepository'
import { cosineSimilarity } from '../../domain/services/EmbeddingCalculator'
import { isValidEmbedding } from '@qhatu/shared'

type SearchScope = 'all' | 'posts' | 'users' | 'hashtags'

interface SearchInput {
  q: string
  viewerId: string
  scope: SearchScope
  embedding?: number[]   // client-computed query vector (384) for semantic search
}

const SEMANTIC_MIN = 0.25  // cosine threshold to count as a semantic match

export class SearchUseCase {
  constructor(
    private readonly searchRepo: ISearchRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: SearchInput) {
    const q = input.q.trim()
    if (q.length === 0) return { posts: [], users: [], hashtags: [], semantic: [] }

    const viewer = await this.userRepo.findById(input.viewerId)
    const domain = viewer?.universityDomain ?? ''

    const wantPosts    = input.scope === 'all' || input.scope === 'posts'
    const wantUsers    = input.scope === 'all' || input.scope === 'users'
    const wantHashtags = input.scope === 'all' || input.scope === 'hashtags'
    const wantSemantic = (input.scope === 'all' || input.scope === 'posts') && isValidEmbedding(input.embedding)

    const [posts, users, hashtags, semantic] = await Promise.all([
      wantPosts    ? this.searchRepo.searchPosts(q, domain, input.scope === 'posts' ? 30 : 10) : Promise.resolve([]),
      wantUsers    ? this.searchRepo.searchUsers(q, input.scope === 'users' ? 30 : 8)          : Promise.resolve([]),
      wantHashtags ? this.searchRepo.searchHashtags(q, input.scope === 'hashtags' ? 30 : 8)    : Promise.resolve([]),
      wantSemantic ? this.semanticSearch(input.embedding!, domain, input.scope === 'posts' ? 20 : 10) : Promise.resolve([]),
    ])

    // Drop semantic hits already covered by full-text (dedup)
    const textIds = new Set(posts.map((p) => p.id))
    const semanticOnly = semantic.filter((s) => !textIds.has(s.id))

    return {
      posts:    posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
      users,
      hashtags,
      semantic: semanticOnly.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    }
  }

  /** Cosine-rank all post vectors in the viewer's university against the query vector. */
  private async semanticSearch(queryVec: number[], domain: string, limit: number) {
    const vectors = await this.searchRepo.allPostVectors(domain)
    const scored = vectors
      .map((v) => ({ postId: v.postId, score: cosineSimilarity(queryVec, v.vector) }))
      .filter((x) => x.score >= SEMANTIC_MIN)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
    return this.searchRepo.postsByIds(scored.map((s) => s.postId))
  }
}
