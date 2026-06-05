export function formatDistanceToNow(dateStr: string | Date): string {
  const date  = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const delta = Math.floor((Date.now() - date.getTime()) / 1000)

  if (delta < 60)          return `${delta}s`
  if (delta < 3600)        return `${Math.floor(delta / 60)}m`
  if (delta < 86400)       return `${Math.floor(delta / 3600)}h`
  if (delta < 86400 * 7)   return `${Math.floor(delta / 86400)}d`
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}
