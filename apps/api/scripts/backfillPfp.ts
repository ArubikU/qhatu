/**
 * Backfill avatarUrl (Twitter profile picture) for seeded users that lack one —
 * the early seed batches predate pfp capture. Uses twitterapi.io user/info.
 *
 * Run: TWITTER_KEY=new1_xxx bun run scripts/backfillPfp.ts
 */
import { prisma } from '../src/infrastructure/db/prisma'

const KEY = process.env.TWITTER_KEY ?? 'new1_d59b10498cd145ac8a163bf996343203'
const SEED_DOMAINS = [
  'ulima.edu.pe','pucp.edu.pe','upc.edu.pe','up.edu.pe','unmsm.edu.pe',
  'uni.edu.pe','urp.edu.pe','usmp.edu.pe','usil.edu.pe','utp.edu.pe',
  'upch.edu.pe','unfv.edu.pe','esan.edu.pe','cientifica.edu.pe','lima.edu.pe','twitter.edu',
]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchPfp(handle: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.twitterapi.io/twitter/user/info?userName=${encodeURIComponent(handle)}`, {
      headers: { 'X-API-Key': KEY },
    })
    if (res.status === 402) throw new Error('CREDITS')
    if (!res.ok) return null
    const j = await res.json() as { data?: { profilePicture?: string }; profilePicture?: string }
    const pic = j.data?.profilePicture ?? j.profilePicture
    return pic ? pic.replace('_normal.', '_400x400.') : null
  } catch (e) {
    if ((e as Error).message === 'CREDITS') throw e
    return null
  }
}

async function run() {
  const users = await prisma.user.findMany({
    where: { avatarUrl: null, universityDomain: { in: SEED_DOMAINS } },
    select: { id: true, nickname: true },
  })
  console.log(`Backfilling pfp for ${users.length} seeded users …`)

  let done = 0, hit = 0
  for (const u of users) {
    try {
      const pfp = await fetchPfp(u.nickname)
      if (pfp) { await prisma.user.update({ where: { id: u.id }, data: { avatarUrl: pfp } }); hit++ }
    } catch (e) {
      if ((e as Error).message === 'CREDITS') { console.error('⚠ créditos agotados — parando'); break }
    }
    if (++done % 10 === 0) console.log(`  ${done}/${users.length} (${hit} con pfp)`)
    await sleep(5000)  // rate limit ~1 req/5s
  }
  console.log(`✓ backfill: ${hit}/${done} usuarios con pfp`)
  await prisma.$disconnect()
}

run().catch((e) => { console.error(e); process.exit(1) })
