/**
 * Los posts semilla se insertaron con createdAt = now() (los JSON clasificados no
 * traen fecha original), así que todos salen "hace 1h". Esto reparte createdAt de
 * los posts semilla sobre los últimos ~14 días (sesgo a reciente) y ajusta los
 * comentarios para que caigan después de su post. Idempotencia: solo toca posts
 * semilla (isIdentityRevealed = true) — los posts reales de usuarios no se tocan.
 *
 * Run: bun run scripts/spreadSeedDates.ts
 */
import { prisma } from '../src/infrastructure/db/prisma'

const DAYS = 14

function randomPastDate(): Date {
  // random^2 sesga hacia 0 → más posts recientes, cola hacia atrás
  const frac = Math.random() ** 2
  const ms = frac * DAYS * 24 * 60 * 60 * 1000
  return new Date(Date.now() - ms)
}

async function run() {
  const posts = await prisma.post.findMany({
    where: { isIdentityRevealed: true },
    select: { id: true },
  })
  console.log(`Reparteando fechas de ${posts.length} posts semilla…`)

  let updated = 0
  for (const p of posts) {
    const when = randomPastDate()
    await prisma.post.update({ where: { id: p.id }, data: { createdAt: when } })

    // Comentarios: entre el post y ahora (después del post)
    const comments = await prisma.comment.findMany({ where: { postId: p.id }, select: { id: true } })
    for (const c of comments) {
      const after = new Date(when.getTime() + Math.random() * (Date.now() - when.getTime()))
      await prisma.comment.update({ where: { id: c.id }, data: { createdAt: after } })
    }
    updated++
    if (updated % 20 === 0) console.log(`  ${updated}/${posts.length}`)
  }

  console.log(`✓ ${updated} posts + sus comentarios reubicados sobre ${DAYS} días`)
  await prisma.$disconnect()
}

run().catch((e) => { console.error(e); process.exit(1) })
