// ─── Fuente del handler serverless (Vercel) ───────────────────────────────────
// Se empaqueta con esbuild → apps/api/api/index.js (CJS). No escucha puerto ni
// levanta workers persistentes. El feed degrada vía NullStreamProducer sin Redis.
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { FastifyInstance } from 'fastify'
import { buildApp } from './app'
import { ensureSearchIndexes } from './infrastructure/db/ensureSearchIndexes'

let ready: Promise<FastifyInstance> | null = null

function getApp(): Promise<FastifyInstance> {
  if (!ready) {
    ready = (async () => {
      const app = await buildApp()
      await app.ready()
      await ensureSearchIndexes().catch((e) => app.log.error(e))
      return app
    })()
  }
  return ready
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp()
  app.server.emit('request', req, res)
}
