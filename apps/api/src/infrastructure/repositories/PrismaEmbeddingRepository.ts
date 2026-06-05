import type { PrismaClient } from '@prisma/client'
import type { IEmbeddingRepository } from '../../domain/ports/IEmbeddingRepository'

export class PrismaEmbeddingRepository implements IEmbeddingRepository {
  constructor(private readonly db: PrismaClient) {}

  async savePostEmbedding(postId: string, vector: number[]): Promise<void> {
    await this.db.postEmbedding.upsert({
      where:  { postId },
      create: { postId, vector },
      update: { vector },
    })
  }

  async getPostEmbedding(postId: string): Promise<number[] | null> {
    const rec = await this.db.postEmbedding.findUnique({ where: { postId }, select: { vector: true } })
    return rec?.vector ?? null
  }

  async getPostEmbeddings(postIds: string[]): Promise<Record<string, number[]>> {
    if (postIds.length === 0) return {}
    const rows = await this.db.postEmbedding.findMany({
      where:  { postId: { in: postIds } },
      select: { postId: true, vector: true },
    })
    return Object.fromEntries(rows.map((r) => [r.postId, r.vector]))
  }

  async getUserVector(userId: string): Promise<number[] | null> {
    const rec = await this.db.userInterestVector.findUnique({ where: { userId }, select: { vector: true } })
    return rec?.vector ?? null
  }

  async saveUserVector(userId: string, vector: number[]): Promise<void> {
    await this.db.userInterestVector.upsert({
      where:  { userId },
      create: { userId, vector },
      update: { vector },
    })
  }
}
