'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { AtSign, Hash } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  maxLength?: number
  rows?: number
  className?: string
  autoFocus?: boolean
}

interface Suggestion { kind: '@' | '#'; label: string; sub?: string; seed?: string }

/**
 * Textarea with @mention + #hashtag autocomplete.
 * Detects the token under the caret; queries /search; click to insert.
 */
export function MentionTextarea({ value, onChange, placeholder, maxLength = 300, rows = 4, className = '', autoFocus }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const ref = useRef<HTMLTextAreaElement>(null)
  const [sugs, setSugs]       = useState<Suggestion[]>([])
  const [open, setOpen]       = useState(false)
  const [active, setActive]   = useState(0)
  const tokenRef = useRef<{ start: number; trigger: '@' | '#' } | null>(null)

  useEffect(() => { if (autoFocus) ref.current?.focus() }, [autoFocus])

  // Find @ or # token immediately left of caret
  const detectToken = useCallback((text: string, caret: number) => {
    let i = caret - 1
    while (i >= 0) {
      const ch = text[i]!
      if (ch === '@' || ch === '#') {
        // token must start at line/text start or after whitespace
        if (i === 0 || /\s/.test(text[i - 1]!)) {
          return { start: i, trigger: ch as '@' | '#', query: text.slice(i + 1, caret) }
        }
        return null
      }
      if (/\s/.test(ch)) return null
      i--
    }
    return null
  }, [])

  const runQuery = useCallback(async (trigger: '@' | '#', q: string) => {
    if (q.length < 1) { setOpen(false); return }
    try {
      if (trigger === '@') {
        const res = await api.search.query(q, 'users', accessToken ?? '')
        setSugs(res.users.slice(0, 6).map((u) => ({ kind: '@', label: u.nickname, sub: u.faculty ?? undefined, seed: u.avatarSeed })))
      } else {
        const res = await api.search.query(q, 'hashtags', accessToken ?? '')
        setSugs(res.hashtags.slice(0, 6).map((h) => ({ kind: '#', label: h.tag, sub: `${h.postCount} posts` })))
      }
      setActive(0); setOpen(true)
    } catch { setOpen(false) }
  }, [accessToken])

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text  = e.target.value
    onChange(text)
    const caret = e.target.selectionStart ?? text.length
    const tok   = detectToken(text, caret)
    if (tok) {
      tokenRef.current = { start: tok.start, trigger: tok.trigger }
      runQuery(tok.trigger, tok.query)
    } else {
      setOpen(false); tokenRef.current = null
    }
  }

  const insert = (s: Suggestion) => {
    const tok = tokenRef.current
    if (!tok || !ref.current) return
    const caret = ref.current.selectionStart ?? value.length
    const before = value.slice(0, tok.start)
    const after  = value.slice(caret)
    const inserted = `${tok.trigger}${s.label} `
    const next = before + inserted + after
    onChange(next)
    setOpen(false); tokenRef.current = null
    requestAnimationFrame(() => {
      const pos = (before + inserted).length
      ref.current?.focus()
      ref.current?.setSelectionRange(pos, pos)
    })
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || sugs.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % sugs.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + sugs.length) % sugs.length) }
    else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insert(sugs[active]!) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={onInput}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={className}
      />
      {open && sugs.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 liquid-glass rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
          {sugs.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); insert(s) }}
              onMouseEnter={() => setActive(i)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${i === active ? 'bg-primary/20' : 'hover:bg-white/5'}`}
            >
              <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20 text-primary">
                {s.kind === '@' ? <AtSign size={14} /> : <Hash size={14} />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm text-white font-body truncate">{s.kind}{s.label}</span>
                {s.sub && <span className="block text-[11px] text-white/40 font-body truncate">{s.sub}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
