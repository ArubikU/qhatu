import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-primary" />
    </div>
  )
}
