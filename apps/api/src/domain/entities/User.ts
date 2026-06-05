// Domain entity — plain TypeScript, zero Prisma/external imports
export interface User {
  id: string
  emailHash: string
  nickname: string
  avatarSeed: string
  faculty: string | null
  ageRange: string | null
  gender: string | null
  universityDomain: string
  streakCount: number
  totalLikesEarned: number
  createdAt: Date
}
