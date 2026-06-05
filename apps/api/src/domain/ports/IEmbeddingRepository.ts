export interface IEmbeddingRepository {
  savePostEmbedding(postId: string, vector: number[]): Promise<void>
  getPostEmbedding(postId: string): Promise<number[] | null>
  getPostEmbeddings(postIds: string[]): Promise<Record<string, number[]>>
  getUserVector(userId: string): Promise<number[] | null>
  saveUserVector(userId: string, vector: number[]): Promise<void>
}
