import { useState } from 'react'
import { cn } from '../../lib/utils'

const filters = ['Todos', 'Ingeniería', 'Letras', 'Ciencias', 'Administración', 'Medicina']

export default function FilterChips() {
  const [active, setActive] = useState('Todos')

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      {filters.map((filter) => {
        const isActive = active === filter
        return (
          <button
            key={filter}
            onClick={() => setActive(filter)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
              isActive
                ? 'bg-[#7B3FF2]/30 border-[#7B3FF2] text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            )}
          >
            {filter}
          </button>
        )
      })}
    </div>
  )
}
