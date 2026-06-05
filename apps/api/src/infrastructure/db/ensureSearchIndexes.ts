import { prisma } from './prisma'

/**
 * Idempotent search index setup. Runs once at startup.
 * Avoids a dedicated migration for raw GIN/trigram indexes Prisma can't express.
 *  - pg_trgm extension for fuzzy nickname/hashtag search
 *  - GIN tsvector index for post full-text search (Spanish config)
 *  - GIN trigram indexes for nickname + hashtag prefix/fuzzy match
 */
export async function ensureSearchIndexes(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS posts_content_fts ON posts USING GIN (to_tsvector('spanish', content));`,
    )
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS users_nickname_trgm ON users USING GIN (nickname gin_trgm_ops);`,
    )
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS hashtags_tag_trgm ON hashtags USING GIN (tag gin_trgm_ops);`,
    )
    console.log('[search] indexes ensured')
  } catch (err) {
    console.error('[search] failed to ensure indexes:', (err as Error).message)
  }
}
