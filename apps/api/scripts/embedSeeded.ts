/**
 * Generate MiniLM embeddings (384-dim) for posts that lack one — same model the
 * client uses (Xenova/all-MiniLM-L6-v2, mean-pooled + normalized) so they share
 * one cosine space. Run after seeding.
 *
 * Run: bun run scripts/embedSeeded.ts
 */
import { pipeline, env } from '@huggingface/transformers'
import { prisma } from '../src/infrastructure/db/prisma'
import { EMBEDDING_MODEL } from '@qhatu/shared'

env.allowLocalModels = false  // fetch from HF hub

async function run() {
  // Posts without an embedding
  const posts = await prisma.post.findMany({
    where: { deletedAt: null, embedding: { is: null } },
    select: { id: true, content: true, hashtags: { include: { hashtag: { select: { tag: true } } } } },
  })
  console.log(`Embedding ${posts.length} posts with ${EMBEDDING_MODEL} …`)
  if (posts.length === 0) { await prisma.$disconnect(); return }

  const extractor = await pipeline('feature-extraction', EMBEDDING_MODEL)

  let done = 0
  for (const p of posts) {
    const tags = p.hashtags.map((h) => h.hashtag.tag).join(' ')
    const text = `${p.content} ${tags}`.trim()
    const out  = await extractor(text, { pooling: 'mean', normalize: true })
    const vec  = Array.from(out.data as Float32Array)
    await prisma.postEmbedding.upsert({
      where:  { postId: p.id },
      create: { postId: p.id, vector: vec },
      update: { vector: vec },
    })
    if (++done % 10 === 0) console.log(`  ${done}/${posts.length}`)
  }

  console.log(`✓ embedded ${done} posts`)
  await prisma.$disconnect()
}

run().catch((e) => { console.error(e); process.exit(1) })
