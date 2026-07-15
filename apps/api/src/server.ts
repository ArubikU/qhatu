// ─── Entry long-running (dev local + Docker/Railway) ──────────────────────────
// Arranca la app, escucha puerto y levanta workers/cron. En serverless (Vercel)
// se usa api/index.ts en su lugar (sin listen, sin workers persistentes).
import { buildApp } from './app'
import { ensureSearchIndexes } from './infrastructure/db/ensureSearchIndexes'
import { setupWorkers } from './infrastructure/workers/setupWorkers'
import { startRankingsCron } from './infrastructure/cron/rankingsCron'

const PORT = Number(process.env.PORT ?? 3002)

async function main() {
  const app = await buildApp()
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' })
    app.log.info(`API running on http://localhost:${PORT}`)

    // Índices full-text + trigram (idempotente)
    await ensureSearchIndexes()
    // Workers de background (se saltan solos si no hay REDIS_URL)
    await setupWorkers()
    // Cron de rankings diarios (+ cómputo inicial)
    startRankingsCron()
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()
