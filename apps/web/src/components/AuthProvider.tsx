'use client'
import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api, ApiError } from '@/lib/api'

/**
 * Runs once on mount. If the user has no AT in memory (page refresh),
 * tries to silently restore the session via the RT cookie.
 * After getting a new AT, fetches /users/me to restore the user object.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, clearAuth } = useAuthStore()
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current || accessToken) return
    attempted.current = true

    api.auth.refresh()
      .then(async ({ accessToken: newAt }) => {
        // Restore user profile alongside the token
        const user = await api.users.me(newAt).catch(() => null)
        useAuthStore.setState({
          accessToken: newAt,
          user: user
            ? { nickname: user.nickname, avatarSeed: user.avatarSeed, faculty: user.faculty }
            : null,
        })
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) clearAuth()
      })
  }, [accessToken, clearAuth])

  return <>{children}</>
}
