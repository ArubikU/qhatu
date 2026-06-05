import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
})

export const VerifyOtpSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otp: z.string().length(6).regex(/^\d{6}$/),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export const PushSubscriptionSchema = z.object({
  subscription: z.string().min(1), // JSON serialized PushSubscription
})

export type Register   = z.infer<typeof RegisterSchema>
export type VerifyOtp  = z.infer<typeof VerifyOtpSchema>
