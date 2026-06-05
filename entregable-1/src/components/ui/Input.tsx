import { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  inputPrefix?: ReactNode
  suffix?: ReactNode
}

export default function Input({ inputPrefix, suffix, className, ...props }: InputProps) {
  return (
    <div className="relative flex items-center">
      {inputPrefix && (
        <span className="absolute left-4 text-white/40 pointer-events-none">
          {inputPrefix}
        </span>
      )}
      <input
        className={cn(
          'w-full bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[#7B3FF2] transition-colors py-3 px-4',
          inputPrefix ? 'pl-11' : undefined,
          suffix ? 'pr-11' : undefined,
          className
        )}
        {...props}
      />
      {suffix && (
        <span className="absolute right-4 pointer-events-none">{suffix}</span>
      )}
    </div>
  )
}
