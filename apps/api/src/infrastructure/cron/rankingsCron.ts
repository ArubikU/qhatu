import cron from 'node-cron'
import { Prisma } from '@prisma/client'
import { prisma } from '../db/prisma'

type RankingType = 'LIKES_RECEIVED' | 'POSTS_PUBLISHED' | 'COMMENTS_MADE'

interface RankRow { userId: string; rank: number; value: number }

function startOfToday(): Date {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d
}

async function rankedRows(type: RankingType, since: Date): Promise<RankRow[]> {
  // RANK() partitioned by university, top 100 per uni, only users with activity today.
  if (type === 'POSTS_PUBLISHED') {
    return prisma.$queryRaw<RankRow[]>(Prisma.sql`
      SELECT "userId", rank::int AS rank, value FROM (
        SELECT u.id AS "userId",
               RANK() OVER (PARTITION BY u."universityDomain" ORDER BY COUNT(p.id) DESC) AS rank,
               COUNT(p.id)::int AS value
        FROM users u
        JOIN posts p ON p."authorId" = u.id AND p."deletedAt" IS NULL AND p."createdAt" >= ${since}
        GROUP BY u.id, u."universityDomain"
        HAVING COUNT(p.id) > 0
      ) t WHERE rank <= 100`)
  }
  if (type === 'COMMENTS_MADE') {
    return prisma.$queryRaw<RankRow[]>(Prisma.sql`
      SELECT "userId", rank::int AS rank, value FROM (
        SELECT u.id AS "userId",
               RANK() OVER (PARTITION BY u."universityDomain" ORDER BY COUNT(c.id) DESC) AS rank,
               COUNT(c.id)::int AS value
        FROM users u
        JOIN comments c ON c."authorId" = u.id AND c."deletedAt" IS NULL AND c."createdAt" >= ${since}
        GROUP BY u.id, u."universityDomain"
        HAVING COUNT(c.id) > 0
      ) t WHERE rank <= 100`)
  }
  // LIKES_RECEIVED
  return prisma.$queryRaw<RankRow[]>(Prisma.sql`
    SELECT "userId", rank::int AS rank, value FROM (
      SELECT u.id AS "userId",
             RANK() OVER (PARTITION BY u."universityDomain" ORDER BY COUNT(r.id) DESC) AS rank,
             COUNT(r.id)::int AS value
      FROM users u
      JOIN posts p ON p."authorId" = u.id AND p."deletedAt" IS NULL
      JOIN reactions r ON r."postId" = p.id AND r."createdAt" >= ${since}
      GROUP BY u.id, u."universityDomain"
      HAVING COUNT(r.id) > 0
    ) t WHERE rank <= 100`)
}

export async function computeRankings(): Promise<void> {
  const today = startOfToday()
  const types: RankingType[] = ['LIKES_RECEIVED', 'POSTS_PUBLISHED', 'COMMENTS_MADE']

  for (const type of types) {
    try {
      const rows = await rankedRows(type, today)

      // Replace today's snapshot for this type
      await prisma.dailyRanking.deleteMany({ where: { date: today, type } })
      if (rows.length > 0) {
        await prisma.dailyRanking.createMany({
          data: rows.map((r) => ({ userId: r.userId, date: today, type, value: r.value, rank: r.rank })),
          skipDuplicates: true,
        })
      }

      // Update each user's best-ever rank (for the RANKING reward unlocks)
      for (const r of rows.filter((x) => x.rank <= 10)) {
        await prisma.user.updateMany({
          where: { id: r.userId, OR: [{ bestRank: null }, { bestRank: { gt: r.rank } }] },
          data:  { bestRank: r.rank },
        })
      }
    } catch (err) {
      console.error(`[rankingsCron] ${type} failed:`, (err as Error).message)
    }
  }
  console.log('[rankingsCron] rankings computed')
}

export function startRankingsCron(): void {
  // Daily at 00:05 server time
  cron.schedule('5 0 * * *', () => { computeRankings().catch(() => null) })
  // Initial run deferred ~15s so the DB pool warms (Neon cold-start) before we hit it
  setTimeout(() => { computeRankings().catch(() => null) }, 15_000)
  console.log('[rankingsCron] scheduled (daily 00:05) + deferred initial run')
}
