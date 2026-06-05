import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Smile, Camera, Hash, AtSign, BarChart2, Globe, GraduationCap, Users, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const MAX_CHARS = 300

const visibilityOptions = [
  { id: 'todos', icon: Globe, label: 'Todos' },
  { id: 'facultad', icon: GraduationCap, label: 'Mi facultad' },
  { id: 'generacion', icon: Users, label: 'Mi generación' },
]

export default function PostComposer() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [visibility, setVisibility] = useState('todos')
  const [isPublishing, setIsPublishing] = useState(false)

  const length = text.length
  const remaining = MAX_CHARS - length
  const percentage = Math.min(length / MAX_CHARS, 1)
  const isOverLimit = length > MAX_CHARS
  const canPublish = length > 0 && !isOverLimit && !isPublishing

  const radius = 11
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - percentage)

  const circleColor = percentage > 0.95 ? '#ef4444' : percentage > 0.8 ? '#eab308' : '#7B3FF2'

  const handlePublish = () => {
    if (!canPublish) return
    setIsPublishing(true)
    setTimeout(() => navigate('/feed'), 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="flex flex-col min-h-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white transition-colors">
          <X size={22} />
        </button>
        <h1
          className="text-white font-semibold text-base"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Nuevo post
        </h1>
        <div className="w-6" />
      </div>

      {/* Composer area */}
      <div className="flex-1 px-4 pt-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B3FF2] to-[#4B17B6] flex items-center justify-center text-white font-bold text-sm shrink-0">
            C
          </div>

          {/* Textarea */}
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="¿Qué está pasando en el campus?"
              rows={5}
              className="w-full bg-transparent text-white placeholder-white/30 text-sm leading-relaxed resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Quick action icons */}
        <div className="flex gap-4 mt-4 px-1 border-t border-white/8 pt-4">
          {[Smile, Camera, Hash, AtSign, BarChart2].map((Icon, i) => (
            <button key={i} className="text-white/40 hover:text-[#7B3FF2] transition-colors">
              <Icon size={20} />
            </button>
          ))}
        </div>

        {/* Visibility selector */}
        <div className="flex gap-2 mt-4">
          {visibilityOptions.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setVisibility(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all',
                visibility === id
                  ? 'bg-[#7B3FF2]/30 border-[#7B3FF2] text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-8 pt-4 border-t border-white/8 flex items-center justify-between">
        {/* Char counter */}
        <div className="relative flex items-center justify-center w-10 h-10">
          <svg width="40" height="40" className="-rotate-90">
            <circle
              cx="20" cy="20" r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2.5"
              fill="none"
            />
            <circle
              cx="20" cy="20" r={radius}
              stroke={circleColor}
              strokeWidth="2.5"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.15s, stroke 0.15s' }}
            />
          </svg>
          <span
            className={cn(
              'absolute text-[10px] font-medium',
              isOverLimit ? 'text-red-400' : percentage > 0.8 ? 'text-yellow-400' : 'text-white/60'
            )}
          >
            {remaining < 30 || isOverLimit ? (isOverLimit ? `-${-remaining}` : remaining) : ''}
          </span>
        </div>

        {/* Publish button */}
        <button
          onClick={handlePublish}
          disabled={!canPublish}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200',
            canPublish
              ? 'bg-[#7B3FF2] text-white shadow-[0_0_20px_rgba(123,63,242,0.5)] hover:shadow-[0_0_30px_rgba(123,63,242,0.7)]'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          )}
        >
          <Send size={16} />
          {isPublishing ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </motion.div>
  )
}
