'use client'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

interface SSEEvent {
  type: 'connected' | 'NEW_POSTS' | 'ping'
  universityDomain?: string
}

interface UseSSEFeedResult {
  newPostsAvailable: boolean
  resetNewPosts: () => void
}

/**
 * Connects to /stream and tracks whether new posts have been published
 * since the viewer last loaded the feed.
 */
export function useSSEFeed(): UseSSEFeedResult {
  const accessToken  = useAuthStore((s) => s.accessToken)
  const [newPosts, setNewPosts] = useState(false)
  const sourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!accessToken) return

    // Can't pass Authorization header via EventSource — use Next.js proxy
    // The cookie is sent automatically (same-origin via proxy).
    // For the AT, we use a query param (short-lived, auth-only use case).
    const url = `/api/stream?_at=${encodeURIComponent(accessToken)}`
    const es  = new EventSource(url, { withCredentials: true })
    sourceRef.current = es

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as SSEEvent
        if (data.type === 'NEW_POSTS') {
          setNewPosts(true)
        }
      } catch {}
    }

    es.onerror = () => {
      // Browser auto-reconnects EventSource — no manual retry needed
    }

    return () => {
      es.close()
      sourceRef.current = null
    }
  }, [accessToken])

  return {
    newPostsAvailable: newPosts,
    resetNewPosts:     () => setNewPosts(false),
  }
}
