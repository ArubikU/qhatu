export interface ISocialRepository {
  followUser(followerId: string, targetNickname: string): Promise<void>
  unfollowUser(followerId: string, targetNickname: string): Promise<void>
  isFollowingUser(followerId: string, targetNickname: string): Promise<boolean>
  getFollowedNicknames(followerId: string): Promise<string[]>
}
