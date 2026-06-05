import type { ISocialRepository } from '../../domain/ports/ISocialRepository'
import type { IUserRepository } from '../../domain/ports/IUserRepository'
import type { IStreamProducer } from '../../domain/ports/IStreamProducer'

interface FollowInput {
  followerId: string
  targetNickname: string
  action: 'follow' | 'unfollow'
}

interface FollowOutput {
  following: boolean
}

export class FollowUseCase {
  constructor(
    private readonly socialRepo: ISocialRepository,
    private readonly userRepo: IUserRepository,
    private readonly stream: IStreamProducer,
  ) {}

  async execute(input: FollowInput): Promise<FollowOutput> {
    const { followerId, targetNickname, action } = input

    const target = await this.userRepo.findByNickname(targetNickname)
    if (!target) throw new Error('Usuario no encontrado.')
    if (target.id === followerId) throw new Error('No puedes seguirte a ti mismo.')

    if (action === 'follow') {
      await this.socialRepo.followUser(followerId, targetNickname)
      // authorId = recipient of the follow notification
      this.stream.publish({
        type:      'USER_FOLLOWED',
        userId:    followerId,
        authorId:  target.id,
        timestamp: Date.now(),
      }).catch(() => null)
      return { following: true }
    }

    await this.socialRepo.unfollowUser(followerId, targetNickname)
    return { following: false }
  }
}
