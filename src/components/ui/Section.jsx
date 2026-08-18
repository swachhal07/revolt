import Container from './Container'
import { cn } from '@/utils/cn'

/** A page section with consistent vertical rhythm and optional heading block. */
export default function Section({ id, eyebrow, title, description, className, children }) {
  return (
    <section id={id} className={cn('py-16 sm:py-24', className)}>
      <Container>
        {(eyebrow || title || description) && (
          <div className="mb-10 max-w-2xl">
            {eyebrow && (
              <p className="mb-3 text-sm font-semibold tracking-widest text-brand-600 uppercase">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-lg text-ink-500">{description}</p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
