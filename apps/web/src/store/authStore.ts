'use client'
import { create } from 'zustand'
import type { AuthUser } from '@/lib/api'

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  setAuth: (accessToken: string, user: AuthUser) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

// Memory-only store — no persist middleware.
// Access token lives only in memory (lost on page close/refresh → triggers silent /auth/refresh).
// Refresh token lives in HttpOnly cookie (managed by the browser, never visible to JS).
export const useAuthStore = create<AuthState>()((set, get) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
  isAuthenticated: () => !!get().accessToken,
}))
