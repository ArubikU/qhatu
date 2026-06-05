export interface Comment {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: Date
  deletedAt: Date | null
}
