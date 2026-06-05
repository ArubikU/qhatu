import Link from 'next/link'
import { Ghost } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-carbon flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Ghost size={28} className="text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-white font-heading mb-2">404</h1>
      <p className="text-white/50 text-sm font-body mb-6">Esta página se esfumó como un post efímero.</p>
      <Link href="/feed" className="bg-primary text-white text-sm font-body px-5 py-2.5 rounded-full">
        Volver al feed
      </Link>
    </div>
  )
}
