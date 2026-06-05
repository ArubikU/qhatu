import { Prisma, type PrismaClient } from '@prisma/client'
import type {
  ISearchRepository,
  PostSearchResult,
  UserSearchResult,
  HashtagSearchResult,
} from '../../domain/ports/ISearchRepository'

export class PrismaSearchRepository implements ISearchRepository {
  constructor(private readonly db: PrismaClient) {}

  async searchPosts(q: string, _universityDomain: string, limit: number): Promise<PostSearchResult[]> {
    // Full-text rank on content (Spanish), restricted to viewer's university.
    // Author shown only if isIdentityRevealed, else 'Anónimo' (anonymity preserved).
    const rows = await this.db.$queryRaw<Array<{
      id: string
      content: string
      createdAt: Date
      likesCount: number
      commentsCount: number
      nickname: string
      avatarSeed: string
      isIdentityRevealed: boolean
      hasMedia: boolean
    }>>(Prisma.sql`
      SELECT p.id, p.content, p."createdAt", p."likesCount", p."commentsCount",
             u.nickname, u."avatarSeed", p."isIdentityRevealed",
             EXISTS (SELECT 1 FROM post_media pm WHERE pm."postId" = p.id) AS "hasMedia"
      FROM posts p
      JOIN users u ON u.id = p."authorId"
      WHERE p."deletedAt" IS NULL
        AND (p."expiresAt" IS NULL OR p."expiresAt" > NOW())
        AND to_tsvector('spanish', p.content) @@ plainto_tsquery('spanish', ${q})
      ORDER BY ts_rank(to_tsvector('spanish', p.content), plainto_tsquery('spanish', ${q})) DESC,
               p."createdAt" DESC
      LIMIT ${limit}
    `)

    return rows.map((r) => ({
      id:               r.id,
      content:          r.content,
      authorNickname:   r.isIdentityRevealed ? r.nickname : 'Anónimo',
      authorAvatarSeed: r.avatarSeed,
      createdAt:        r.createdAt,
      likesCount:       r.likesCount,
      commentsCount:    r.commentsCount,
      hasMedia:         r.hasMedia,
    }))
  }

  async searchUsers(q: string, limit: number): Promise<UserSearchResult[]> {
    // Trigram similarity on nickname (fuzzy). Threshold via similarity().
    const rows = await this.db.$queryRaw<Array<{
      nickname: string
      avatarSeed: string
      faculty: string | null
    }>>(Prisma.sql`
      SELECT nickname, "avatarSeed", faculty
      FROM users
      WHERE nickname ILIKE ${'%' + q + '%'}
         OR similarity(nickname, ${q}) > 0.2
      ORDER BY similarity(nickname, ${q}) DESC, nickname ASC
      LIMIT ${limit}
    `)
    return rows
  }

  async searchHashtags(q: string, limit: number): Promise<HashtagSearchResult[]> {
    const clean = q.replace(/^#/, '').toLowerCase()
    const rows = await this.db.$queryRaw<Array<{ tag: string; postCount: number }>>(Prisma.sql`
      SELECT tag, "postCount"
      FROM hashtags
      WHERE tag ILIKE ${'%' + clean + '%'}
         OR similarity(tag, ${clean}) > 0.2
      ORDER BY "postCount" DESC, similarity(tag, ${clean}) DESC
      LIMIT ${limit}
    `)
    return rows.map((r) => ({ tag: r.tag, postCount: Number(r.postCount) }))
  }

  async allPostVectors(_universityDomain: string): Promise<{ postId: string; vector: number[] }[]> {
    // Global semantic search (multi-university, like the feed's recent/trending)
    const rows = await this.db.postEmbedding.findMany({
      where: {
        post: {
          deletedAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      },
      select: { postId: true, vector: true },
    })
    return rows
  }

  async postsByIds(ids: string[]): Promise<PostSearchResult[]> {
    if (ids.length === 0) return []
    const rows = await this.db.post.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: {
        id: true, content: true, createdAt: true, likesCount: true, commentsCount: true,
        isIdentityRevealed: true,
        author: { select: { nickname: true, avatarSeed: true } },
        media: { select: { id: true }, take: 1 },
      },
    })
    const byId = new Map(rows.map((r) => [r.id, r]))
    // Preserve the ranked order from `ids`
    return ids.flatMap((id) => {
      const r = byId.get(id)
      if (!r) return []
      return [{
        id:               r.id,
        content:          r.content,
        authorNickname:   r.isIdentityRevealed ? r.author.nickname : 'Anónimo',
        authorAvatarSeed: r.author.avatarSeed,
        createdAt:        r.createdAt,
        likesCount:       r.likesCount,
        commentsCount:    r.commentsCount,
        hasMedia:         r.media.length > 0,
      }]
    })
  }
}
