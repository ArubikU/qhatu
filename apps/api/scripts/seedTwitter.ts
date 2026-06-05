/**
 * Seed posts from classified tweets (written by the search sub-agents to
 * scripts/seed-data/*.json). Each tweet author becomes a seeded user under
 * @twitter.edu using their handle as the anonymous nickname.
 *
 * Run: bun run scripts/seedTwitter.ts
 */
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { prisma } from '../src/infrastructure/db/prisma'
import { hashEmail } from '../src/infrastructure/security/hashEmail'
import { PrismaPostRepository } from '../src/infrastructure/repositories/PrismaPostRepository'
import { S3StorageService } from '../src/infrastructure/storage/S3StorageService'
import { extractHashtags } from '../src/infrastructure/services/HashtagExtractor'

interface SeedComment { handle: string; name?: string; text: string; pfp?: string | null }
interface SeedTweet { handle: string; name?: string; text: string; likes?: number; uni?: string; spicy?: number; comments?: SeedComment[]; images?: string[]; pfp?: string | null }

const UNI_DOMAIN: Record<string, string> = {
  ulima: 'ulima.edu.pe', pucp: 'pucp.edu.pe', upc: 'upc.edu.pe',
  up: 'up.edu.pe', unmsm: 'unmsm.edu.pe',
  uni: 'uni.edu.pe', urp: 'urp.edu.pe', usmp: 'usmp.edu.pe',
  usil: 'usil.edu.pe', utp: 'utp.edu.pe', upch: 'upch.edu.pe',
  unfv: 'unfv.edu.pe', esan: 'esan.edu.pe', cientifica: 'cientifica.edu.pe',
  ucsur: 'cientifica.edu.pe', otras: 'lima.edu.pe',
}

function sanitizeNick(handle: string): string {
  const base = handle.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)
  return base.length >= 2 ? base : `tw${base}`
}

async function uniqueNick(handle: string): Promise<string> {
  const base = sanitizeNick(handle)
  let nick = base, i = 1
  while (await prisma.user.findUnique({ where: { nickname: nick } })) {
    nick = `${base}${i++}`.slice(0, 28)
  }
  return nick
}

async function run() {
  const dir = join(__dirname, 'seed-data')
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  const tweets: SeedTweet[] = []
  for (const f of files) {
    try {
      const arr = JSON.parse(readFileSync(join(dir, f), 'utf8')) as SeedTweet[]
      if (Array.isArray(arr)) tweets.push(...arr)
    } catch (e) { console.warn('skip', f, (e as Error).message) }
  }
  console.log(`Loaded ${tweets.length} tweets from ${files.length} files`)

  const postRepo = new PrismaPostRepository(prisma, new S3StorageService())
  let usersCreated = 0, postsCreated = 0, commentsCreated = 0

  // Upsert a seeded user from a twitter handle → returns userId. Backfills pfp.
  const upsertUser = async (handle: string, uni?: string, pfp?: string | null): Promise<string> => {
    const emailHash = hashEmail(`${handle}@twitter.edu`)
    const existing  = await prisma.user.findUnique({ where: { emailHash }, select: { id: true, avatarUrl: true } })
    // Twitter's _normal pfp is tiny — request the bigger variant
    const avatarUrl = pfp ? pfp.replace('_normal.', '_400x400.') : null
    if (existing) {
      if (avatarUrl && !existing.avatarUrl) {
        await prisma.user.update({ where: { id: existing.id }, data: { avatarUrl } })
      }
      return existing.id
    }
    const u = await prisma.user.create({
      data: {
        emailHash,
        nickname:         await uniqueNick(handle),
        avatarSeed:       Math.random().toString(36).slice(2, 10),
        avatarUrl,
        universityDomain: UNI_DOMAIN[uni ?? ''] ?? 'twitter.edu',
      },
    })
    usersCreated++
    return u.id
  }

  for (const t of tweets) {
    if (!t.handle || !t.text?.trim()) continue
    const content = t.text.trim().slice(0, 1000)
    const authorId = await upsertUser(t.handle, t.uni, t.pfp)

    // Idempotent: reuse existing post or create
    let post = await prisma.post.findFirst({ where: { authorId, content }, select: { id: true } })
    if (!post) {
      const tags = extractHashtags(content)
      const hashtagIds: string[] = []
      for (const tag of tags) hashtagIds.push(await postRepo.findOrCreateHashtag(tag))
      // Seeded Twitter image URLs stored as PostMedia keys → resolveUrl passthrough
      const media = (t.images ?? []).slice(0, 5).map((url) => ({ key: url, type: 'IMAGE' as const }))
      const created = await postRepo.create({
        authorId, content, type: 'TEXT', isIdentityRevealed: true, expiresAt: null, hashtagIds,
        media: media.length ? media : undefined,
      })
      post = { id: created.id }
      postsCreated++
    }

    // Seed comments (each commenter = new seeded account)
    for (const c of t.comments ?? []) {
      if (!c.handle || !c.text?.trim()) continue
      const cContent = c.text.trim().slice(0, 300)
      const cAuthorId = await upsertUser(c.handle, t.uni, c.pfp)
      const dupC = await prisma.comment.findFirst({ where: { postId: post.id, authorId: cAuthorId, content: cContent }, select: { id: true } })
      if (dupC) continue
      await postRepo.createComment(post.id, cAuthorId, cContent)
      commentsCreated++
    }
  }

  console.log(`✓ seeded: ${usersCreated} users, ${postsCreated} posts, ${commentsCreated} comments`)
  await prisma.$disconnect()
}

run().catch((e) => { console.error(e); process.exit(1) })
