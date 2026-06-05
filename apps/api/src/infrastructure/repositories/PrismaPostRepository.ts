import type { PrismaClient, Prisma } from '@prisma/client'
import type {
  IPostRepository,
  CreatePostData,
  FeedOptions,
  PostWithMeta,
  ReactionType,
  ViewerFeedContext,
  MediaItem,
} from '../../domain/ports/IPostRepository'
import type { IStorageService } from '../../domain/ports/IStorageService'
import type { Post } from '../../domain/entities/Post'
import type { Comment } from '../../domain/entities/Comment'

function toDomain(r: {
  id: string
  authorId: string
  content: string
  type: string
  score: number
  velocityScore: number
  isIdentityRevealed: boolean
  reportsCount: number
  likesCount: number
  fireCount: number
  teaCount: number
  dedCount: number
  commentsCount: number
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}): Post {
  return { ...r, type: r.type as Post['type'] }
}

const REACTION_FIELD: Record<ReactionType, keyof Prisma.PostUpdateInput> = {
  LIKE: 'likesCount',
  FIRE: 'fireCount',
  TEA:  'teaCount',
  DED:  'dedCount',
}

// Shared include shape for feed queries (author, hashtags, media, viewer reaction, poll)
function FEED_INCLUDE(viewerId: string) {
  return {
    author:    { select: { nickname: true, avatarSeed: true, avatarUrl: true, faculty: true, equippedFrame: true, equippedNameEffect: true, equippedTitle: true } },
    hashtags:  { include: { hashtag: { select: { tag: true } } } },
    media:     { orderBy: { order: 'asc' as const }, select: { key: true, type: true } },
    reactions: { where: { userId: viewerId }, select: { type: true } },
    poll: {
      include: {
        options: {
          orderBy: { order: 'asc' as const },
          include: { votes: { select: { voterHash: true } } },
        },
      },
    },
  } satisfies Prisma.PostInclude
}

export class PrismaPostRepository implements IPostRepository {
  constructor(
    private readonly db: PrismaClient,
    private readonly storage: IStorageService,
  ) {}

  async create(data: CreatePostData): Promise<Post> {
    const record = await this.db.post.create({
      data: {
        authorId:           data.authorId,
        content:            data.content,
        type:               data.type,
        isIdentityRevealed: data.isIdentityRevealed,
        expiresAt:          data.expiresAt,
        hashtags: {
          create: data.hashtagIds.map((hashtagId) => ({ hashtagId })),
        },
        ...(data.media && data.media.length > 0
          ? {
              media: {
                create: data.media.map((m, i) => ({ key: m.key, type: m.type, order: i })),
              },
            }
          : {}),
        ...(data.poll
          ? {
              poll: {
                create: {
                  question: data.poll.question,
                  options: {
                    create: data.poll.options.map((text, i) => ({ text, order: i })),
                  },
                },
              },
            }
          : {}),
      },
    })
    return toDomain(record)
  }

  async findById(id: string): Promise<Post | null> {
    const record = await this.db.post.findUnique({ where: { id, deletedAt: null } })
    return record ? toDomain(record) : null
  }

  async getPublicPost(id: string): Promise<PostWithMeta | null> {
    const rows = await this.db.post.findMany({ where: { id, deletedAt: null }, include: FEED_INCLUDE('') })
    const [mapped] = await this._mapPosts(rows, '')
    return mapped ?? null
  }

  async softDelete(id: string): Promise<void> {
    await this.db.post.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async getFeed(opts: FeedOptions): Promise<PostWithMeta[]> {
    const { tab, viewerId, cursor, limit } = opts

    // Build order
    let orderBy: Prisma.PostOrderByWithRelationInput[]
    if (tab === 'trending') {
      orderBy = [{ score: 'desc' }, { createdAt: 'desc' }]
    } else {
      orderBy = [{ createdAt: 'desc' }]
    }

    // Build where
    let where: Prisma.PostWhereInput = {
      deletedAt: null,
      // Hide expired ephemeral posts
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    }

    if (tab === 'following') {
      // Get nicknames the viewer follows
      const follows = await this.db.userFollow.findMany({
        where: { followerId: viewerId, targetNickname: { not: null } },
        select: { targetNickname: true },
      })
      const nicknames = follows.map((f) => f.targetNickname!)
      // Get user IDs for those nicknames
      const authors = await this.db.user.findMany({
        where: { nickname: { in: nicknames } },
        select: { id: true },
      })
      where = { ...where, authorId: { in: authors.map((a) => a.id) } }
    }

    if (cursor) {
      // Cursor: postId of last seen item
      const cursorPost = await this.db.post.findUnique({
        where: { id: cursor },
        select: { createdAt: true, score: true },
      })
      if (cursorPost) {
        if (tab === 'trending') {
          where = {
            ...where,
            OR: [
              { score: { lt: cursorPost.score } },
              { score: cursorPost.score, createdAt: { lt: cursorPost.createdAt } },
            ],
          }
        } else {
          where = { ...where, createdAt: { lt: cursorPost.createdAt } }
        }
      }
    }

    const posts = await this.db.post.findMany({
      where,
      orderBy,
      take: limit,
      include: FEED_INCLUDE(viewerId),
    })

    return this._mapPosts(posts, viewerId)
  }

  async findReaction(
    postId: string,
    userId: string,
    type: ReactionType,
  ): Promise<{ id: string } | null> {
    const r = await this.db.reaction.findUnique({
      where: { postId_userId_type: { postId, userId, type } },
      select: { id: true },
    })
    return r
  }

  async addReaction(postId: string, userId: string, type: ReactionType): Promise<void> {
    const field = REACTION_FIELD[type]
    await this.db.$transaction([
      this.db.reaction.create({ data: { postId, userId, type } }),
      this.db.post.update({
        where: { id: postId },
        data: { [field]: { increment: 1 } },
      }),
    ])
  }

  async removeReaction(id: string, postId: string, type: ReactionType): Promise<void> {
    const field = REACTION_FIELD[type]
    await this.db.$transaction([
      this.db.reaction.delete({ where: { id } }),
      this.db.post.update({
        where: { id: postId },
        data: { [field]: { decrement: 1 } },
      }),
    ])
  }

  async createComment(postId: string, authorId: string, content: string): Promise<Comment> {
    const [comment] = await this.db.$transaction([
      this.db.comment.create({ data: { postId, authorId, content } }),
      this.db.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ])
    return comment as Comment
  }

  async listComments(postId: string, cursor?: string, limit = 20): Promise<Comment[]> {
    const where: Prisma.CommentWhereInput = { postId, deletedAt: null }
    if (cursor) {
      const pivot = await this.db.comment.findUnique({
        where: { id: cursor },
        select: { createdAt: true },
      })
      if (pivot) {
        (where as Prisma.CommentWhereInput).createdAt = { lt: pivot.createdAt }
      }
    }
    const rows = await this.db.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return rows as Comment[]
  }

  async getCommentAuthorNickname(authorId: string): Promise<string> {
    const user = await this.db.user.findUnique({
      where: { id: authorId },
      select: { nickname: true },
    })
    return user?.nickname ?? 'Anónimo'
  }

  async findOrCreateHashtag(tag: string): Promise<string> {
    const normalised = tag.toLowerCase().trim()
    const existing = await this.db.hashtag.findUnique({ where: { tag: normalised } })
    if (existing) {
      await this.db.hashtag.update({
        where: { id: existing.id },
        data: { postCount: { increment: 1 } },
      })
      return existing.id
    }
    const created = await this.db.hashtag.create({
      data: { tag: normalised, postCount: 1 },
    })
    return created.id
  }

  // ─── S3: full ranker support ─────────────────────────────────────────────────

  async getCandidates(viewerId: string, universityDomain: string, limit: number): Promise<PostWithMeta[]> {
    // Prefer the viewer's university; if too few candidates there, broaden to all
    // universities so "Para ti" is never empty (cross-university candidate source).
    const expiryOr: Prisma.PostWhereInput = { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }
    const uniCount = await this.db.post.count({
      where: { deletedAt: null, author: { universityDomain }, ...expiryOr },
    })
    const where: Prisma.PostWhereInput = uniCount >= 10
      ? { deletedAt: null, author: { universityDomain }, ...expiryOr }
      : { deletedAt: null, ...expiryOr }

    const posts = await this.db.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: FEED_INCLUDE(viewerId),
    })
    return this._mapPosts(posts, viewerId)
  }

  // Shared async mapper: resolves media keys → URLs (presigned for private buckets)
  private async _mapPosts(
    posts: Prisma.PostGetPayload<{ include: ReturnType<typeof FEED_INCLUDE> }>[],
    viewerId: string,
  ): Promise<PostWithMeta[]> {
    const viewerVoterHash = await this._voterHash(viewerId)

    return Promise.all(posts.map(async (p) => {
      const media: MediaItem[] = await Promise.all(
        p.media.map(async (m) => ({
          url:  await this.storage.resolveUrl(m.key),
          type: m.type as MediaItem['type'],
        })),
      )

      return {
        ...toDomain(p),
        authorNickname:   p.isIdentityRevealed ? p.author.nickname : 'Anónimo',
        authorAvatarSeed: p.author.avatarSeed,
        authorAvatarUrl:  p.author.avatarUrl ?? null,
        authorFaculty:    p.isIdentityRevealed ? p.author.faculty : null,
        // Frame follows the avatar (already per-author visible). Name effect / title
        // reveal more, so gate them behind identity reveal to preserve anonymity.
        authorFrame:      p.author.equippedFrame ?? null,
        authorNameEffect: p.isIdentityRevealed ? (p.author.equippedNameEffect ?? null) : null,
        authorTitle:      p.isIdentityRevealed ? (p.author.equippedTitle ?? null) : null,
        isMine:           p.authorId === viewerId,
        hashtags:         p.hashtags.map((h) => h.hashtag.tag),
        media,
        myReaction:       p.reactions[0]?.type as ReactionType | null ?? null,
        poll: p.poll ? {
          id:       p.poll.id,
          question: p.poll.question,
          options:  p.poll.options.map((o) => ({
            id: o.id, text: o.text,
            votesCount: o.votes.length,
            isMyVote:   o.votes.some((v) => v.voterHash === viewerVoterHash),
          })),
        } : null,
      }
    }))
  }

  async getViewerFeedContext(viewerId: string): Promise<ViewerFeedContext> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [viewer, follows, seenPosts, affinities, seenToday] = await Promise.all([
      this.db.user.findUnique({
        where: { id: viewerId },
        select: { faculty: true, ageRange: true },
      }),
      this.db.userFollow.findMany({
        where: { followerId: viewerId },
        select: { targetNickname: true, targetHashtagId: true, hashtag: { select: { tag: true } } },
      }),
      this.db.feedView.findMany({
        where: { userId: viewerId },
        orderBy: { viewedAt: 'desc' },
        take: 200,
        select: { postId: true },
      }),
      this.db.userAuthorAffinity.findMany({
        where: { viewerId },
        select: { authorId: true, score: true },
      }),
      // Posts seen today, joined with their author — for feedback-fatigue penalty
      this.db.feedView.findMany({
        where: { userId: viewerId, viewedAt: { gte: startOfDay } },
        select: { post: { select: { authorId: true } } },
      }),
    ])

    // Count how many posts per author the viewer has seen today
    const authorSeenToday: Record<string, number> = {}
    for (const v of seenToday) {
      const aid = v.post.authorId
      authorSeenToday[aid] = (authorSeenToday[aid] ?? 0) + 1
    }

    const followedNicknames = follows.filter((f) => f.targetNickname).map((f) => f.targetNickname!)

    return {
      faculty:          viewer?.faculty ?? null,
      ageRange:         viewer?.ageRange ?? null,
      followedNicknames,
      followedHashtags:  follows.filter((f) => f.hashtag).map((f) => f.hashtag!.tag),
      seenPostIds:       seenPosts.map((s) => s.postId),
      authorAffinities:  Object.fromEntries(affinities.map((a) => [a.authorId, a.score])),
      authorSeenToday,
      isColdStart:       followedNicknames.length === 0 && affinities.length === 0,
    }
  }

  async markSeen(viewerId: string, postIds: string[]): Promise<void> {
    if (postIds.length === 0) return
    await this.db.feedView.createMany({
      data: postIds.map((postId) => ({ userId: viewerId, postId })),
      skipDuplicates: true,
    })
  }

  async updateScore(postId: string, score: number, velocityScore: number): Promise<void> {
    await this.db.post.update({
      where: { id: postId },
      data: { score, velocityScore },
    })
  }

  async votePoll(postId: string, optionId: string, userId: string): Promise<void> {
    const voterHash = await this._voterHash(userId)
    // Resolve the poll + verify the option belongs to it
    const poll = await this.db.poll.findUnique({
      where: { postId },
      include: { options: { select: { id: true } } },
    })
    if (!poll) throw new Error('Este post no tiene encuesta.')
    const optionIds = poll.options.map((o) => o.id)
    if (!optionIds.includes(optionId)) throw new Error('Opción inválida.')

    await this.db.$transaction([
      // Drop prior vote(s) by this voter across the poll → one vote per poll
      this.db.pollVote.deleteMany({ where: { optionId: { in: optionIds }, voterHash } }),
      this.db.pollVote.create({ data: { optionId, voterHash } }),
    ])
  }

  // ─── private helpers ─────────────────────────────────────────────────────────

  private async _voterHash(userId: string): Promise<string> {
    // Anonymous vote tracking: just the userId is enough here since we
    // store per-post hash as userId (no need for cryptographic hash in S2;
    // full anonymous poll hash comes in S3 with dedicated service)
    return userId
  }
}
