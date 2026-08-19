import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * One-shot scroll entrance for a section, driven by ScrollTrigger.
 *
 *   const ref = useScrollReveal()
 *   <section ref={ref}>
 *     <h2 data-reveal>…</h2>
 *     <p data-reveal>…</p>
 *   </section>
 *
 * Attach the ref to the section and mark the parts that should arrive with
 * `data-reveal`. They lift and fade in document order, one behind the next; an
 * element with no marked descendants animates as a whole.
 *
 * Why this rather than a class toggled by an IntersectionObserver — which is
 * what [[useReveal]] still does for the sections that gate a video on the same
 * boolean:
 *
 * - The stagger is a property of the group, not a delay written onto each item.
 *   Nothing recalculates `transitionDelay` per index, and the order survives
 *   items being added or reordered.
 * - `start: 'top 85%'` is measured against the section, so a tall section
 *   starts as its top clears the last fifteen percent of the viewport rather
 *   than when some fraction of its own height happens to be visible. A
 *   threshold means something different for a 400px band than a 200vh one.
 * - It shares Lenis's clock (see [[SmoothScroll]]), so the entrance is sampled
 *   from the same eased scroll value that moved the page.
 *
 * `once` — these are entrances. Replaying them on the way back up turns a
 * detail you notice once into something the page does at you.
 */
export function useScrollReveal({
  start = 'top 85%',
  y = 40,
  duration = 0.8,
  stagger = 0.09,
  // Off by default. A blur costs a repaint of the element's whole box on every
  // frame, which is worth it only where the section is meant to resolve into
  // focus rather than simply arrive — the dark bands, not a row of cards.
  blur = 0,
  selector = '[data-reveal]',
} = {}) {
  const ref = useRef(null)

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return

      const marked = root.querySelectorAll(selector)
      const targets = marked.length ? marked : [root]

      // Reduced motion still needs the content, just not the travel. Bail
      // before the tween exists — a `from` tween hides its targets the moment
      // it is created, so an early return after that point ships a blank
      // section.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(targets, { opacity: 1, y: 0, filter: 'none' })
        return
      }

      gsap.fromTo(
        targets,
        {
          opacity: 0,
          // Per-element override: `data-reveal="16"` travels 16px instead of the
          // section's default. Headings sit close to their final position; cards
          // and panels can afford more.
          y: (i, el) => Number(el.dataset?.reveal) || y,
          ...(blur ? { filter: `blur(${blur}px)` } : null),
        },
        {
          opacity: 1,
          y: 0,
          // Cleared rather than left at `blur(0px)`: a filter of any value makes
          // the element a containing block for fixed descendants and keeps it on
          // its own layer after the tween is done.
          ...(blur ? { filter: 'none' } : null),
          duration,
          stagger,
          // Decelerating: fast off the mark, settling into place. An ease that
          // also accelerates reads as a slide rather than an arrival.
          ease: 'power2.out',
          scrollTrigger: { trigger: root, start, once: true },
        },
      )
    },
    { scope: ref, dependencies: [start, y, duration, stagger, blur, selector] },
  )

  return ref
}
