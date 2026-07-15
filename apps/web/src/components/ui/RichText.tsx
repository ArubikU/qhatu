'use client'
import { useRouter } from 'next/navigation'
import { pushWithFallback } from '@/lib/nav'

const TOKEN = /(@[a-zA-Z0-9_]{2,30}|#[a-zA-ZÀ-ÿ0-9_]{2,30})/g

/** Renders post/comment text with @mentions + #hashtags styled and tappable. */
export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const router = useRouter()
  const parts = text.split(TOKEN)

  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith('@')) {
          return (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); pushWithFallback(router, `/search?q=${encodeURIComponent(p.slice(1))}`) }}
              className="text-lavender font-medium hover:underline"
            >
              {p}
            </button>
          )
        }
        if (p.startsWith('#')) {
          return (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); pushWithFallback(router, `/search?q=${encodeURIComponent(p)}`) }}
              className="text-primary font-medium hover:underline"
            >
              {p}
            </button>
          )
        }
        return <span key={i}>{p}</span>
      })}
    </span>
  )
}
