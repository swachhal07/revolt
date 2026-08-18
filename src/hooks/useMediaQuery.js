import { useEffect, useState } from 'react'

/**
 * Subscribes to a media query and returns whether it currently matches.
 *
 * For layouts that are two different *components*, not two sets of classes —
 * where the responsive answer changes the markup rather than the styling, and a
 * CSS-hidden duplicate would put the same content in the accessibility tree
 * twice.
 *
 *   const wide = useMediaQuery('(min-width: 64rem)')
 *
 * Evaluated during the first render rather than in an effect, so the correct
 * layout paints immediately instead of flashing the other one. Guarded for
 * environments without `window` (prerender, tests), where it resolves false and
 * the narrow layout ships — the safer of the two to be wrong about.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false

    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const list = window.matchMedia(query)
    const apply = () => setMatches(list.matches)

    apply()
    list.addEventListener('change', apply)
    return () => list.removeEventListener('change', apply)
  }, [query])

  return matches
}
