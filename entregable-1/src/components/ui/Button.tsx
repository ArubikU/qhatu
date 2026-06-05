import { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'glass'
  children: ReactNode
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  children,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const base =
    'flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 text-sm px-5 py-3 disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-[#7B3FF2] hover:bg-[#6b2fe2] text-white shadow-[0_0_20px_rgba(123,63,242,0.4)] hover:shadow-[0_0_30px_rgba(123,63,242,0.6)]',
    ghost:
      'bg-transparent border border-white/20 text-white hover:bg-white/5',
    glass:
      'bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10',
  }

  return (
    <button
      className={cn(base, variants[variant], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </button>
  )
}
