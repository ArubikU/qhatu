'use client'
import { Plus, X } from 'lucide-react'

interface PollComposerProps {
  question: string
  options: string[]
  onQuestionChange: (q: string) => void
  onOptionChange: (index: number, value: string) => void
  onAddOption: () => void
  onRemoveOption: (index: number) => void
}

// ─── PollComposer: formulario de encuesta extraído de CreatePostModal ───
export function PollComposer({
  question,
  options,
  onQuestionChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
}: PollComposerProps) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-2xl border border-white/10">

      {/* Campo de pregunta */}
      <input
        value={question}
        onChange={(e) => onQuestionChange(e.target.value)}
        placeholder="¿Cuál es tu pregunta?"
        maxLength={200}
        className="bg-transparent text-white text-sm placeholder-white/30 focus:outline-none font-body"
      />

      {/* Opciones de la encuesta */}
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={opt}
            onChange={(e) => onOptionChange(i, e.target.value)}
            placeholder={`Opción ${i + 1}`}
            maxLength={100}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors font-body"
          />
          {/* Solo mostrar botón de eliminar si hay más de 2 opciones */}
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => onRemoveOption(i)}
              className="text-white/30 hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}

      {/* Agregar opción — máximo 4 */}
      {options.length < 4 && (
        <button
          type="button"
          onClick={onAddOption}
          className="flex items-center gap-1 text-xs text-lavender hover:text-white transition-colors font-body"
        >
          <Plus size={12} />
          Agregar opción
        </button>
      )}
    </div>
  )
}