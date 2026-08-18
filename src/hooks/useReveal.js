import { useEffect, useRef, useState } from 'react'

/**
 * IntersectionObserver-based scroll reveal. Returns a ref to attach to the
 * element and a boolean that flips true once (and stays true) when it enters
 * the viewport. Avoids scroll listeners, which reflow on every frame.
 *
 *   const [ref, shown] = useReveal()
 *   <div ref={ref} className={shown ? 'opacity-100' : 'opacity-0 translate-y-16'} />
 */
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // No observer (older browsers, some headless renderers) means the reveal
    // would never fire and the section would ship blank. Show it outright.
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, shown]
}

/** True on the tick after mount — for staggering above-the-fold entrances. */
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return mounted
}
