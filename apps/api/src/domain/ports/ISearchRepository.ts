export interface PostSearchResult {
  id: string
  content: string
  authorNickname: string
  authorAvatarSeed: string
  createdAt: Date
  likesCount: number
  commentsCount: number
  hasMedia: boolean
}

export interface UserSearchResult {
  nickname: string
  avatarSeed: string
  faculty: string | null
}

export interface HashtagSearchResult {
  tag: string
  postCount: number
}

export interface ISearchRepository {
  searchPosts(q: string, universityDomain: string, limit: number): Promise<PostSearchResult[]>
  searchUsers(q: string, limit: number): Promise<UserSearchResult[]>
  searchHashtags(q: string, limit: number): Promise<HashtagSearchResult[]>
  /** Semantic: all post vectors in a university (for app-side cosine ranking). */
  allPostVectors(universityDomain: string): Promise<{ postId: string; vector: number[] }[]>
  /** Resolve a set of post ids to search-result rows (order = input order). */
  postsByIds(ids: string[]): Promise<PostSearchResult[]>
}
