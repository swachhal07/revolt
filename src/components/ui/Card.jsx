import { cn } from '@/utils/cn'

/** Neutral surface for grouped content. */
export default function Card({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-ink-900/10 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-ink-900/5',
        className,
      )}
    >
      {children}
    </div>
  )
}
