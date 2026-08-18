/**
 * Join class names, dropping falsy values.
 * Lets components do: cn('base', isActive && 'text-brand-600', className)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
