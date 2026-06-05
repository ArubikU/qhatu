import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  nickname:  z.string().min(3).max(30).regex(/^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+$/).optional(),
  faculty:   z.string().max(50).optional(),
  gender:    z.enum(['M', 'F', 'UNSPECIFIED']).optional(),
  ageRange:  z.enum(['R18_20', 'R21_23', 'R24_PLUS']).optional(),
})

export const FollowSchema = z.object({
  targetNickname:  z.string().min(3).max(30).optional(),
  targetHashtagId: z.string().uuid().optional(),
}).refine(d => d.targetNickname || d.targetHashtagId, {
  message: 'Must provide either targetNickname or targetHashtagId',
})

export const BlockSchema = z.object({
  targetNickname: z.string().min(3).max(30),
})

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>
export type Follow        = z.infer<typeof FollowSchema>
