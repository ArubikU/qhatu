/**
 * Extract hashtags from post content.
 * Returns lowercase tags without the '#' prefix.
 * Max 5 hashtags per post. Tags: 2–30 alphanumeric + underscore chars.
 */
export function extractHashtags(content: string): string[] {
  const regex = /#([a-zA-ZÀ-ÿ0-9_]{2,30})/g
  const matches = [...content.matchAll(regex)]
  const seen = new Set<string>()
  const result: string[] = []
  for (const m of matches) {
    const tag = m[1]!.toLowerCase()
    if (!seen.has(tag)) {
      seen.add(tag)
      result.push(tag)
    }
    if (result.length >= 5) break
  }
  return result
}
