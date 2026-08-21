import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '@/utils/lenis'

/**
 * Client-side navigation keeps scroll position by default; reset it on route
 * change.
 *
 * A hash is the exception: `/#charging` from another route is a request for a
 * section, and scrolling to the top of the page instead silently drops the
 * request. The element does not exist until the new route has painted, so the
 * lookup waits a frame; if it still is not there, the top is the safe answer.
 *
 * The jump goes through Lenis when it is running. `window.scrollTo` writes a
 * position Lenis has not been told about, so its next frame eases the page back
 * toward where it thought it was — the route change lands and then drifts. Every
 * move is `immediate`: this is a navigation, not a scroll, and animating it
 * would drag the reader through the whole old page on the way out.
 *
 * A hash landing stops short by the height of the navbar. The bar is fixed and
 * opaque, so putting the target's own top at the viewport's top puts the target
 * behind it — the reader arrives at a section whose heading is under the header
 * they navigated from. Measured off the element rather than written down as a
 * number, because the bar is two heights across the breakpoints and grew by a
 * fraction of a pixel the last time its border changed; a constant here would be
 * wrong on a phone and wrong again after the next edit to the bar.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const lenis = getLenis()

    // Falls back to nothing rather than to a guess: no header means no overlap
    // to clear, and a default would push every landing down a bar's height on a
    // page that has none.
    const navHeight = document.querySelector('header')?.offsetHeight ?? 0

    const jump = (target) => {
      if (target === 0) {
        if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
        else window.scrollTo({ top: 0, behavior: 'instant' })
        return
      }

      if (lenis) {
        // Negative, so it stops short of the element rather than past it.
        lenis.scrollTo(target, { immediate: true, force: true, offset: -navHeight })
        return
      }

      // `scrollIntoView` has no offset, and `scroll-margin-top` would have to be
      // set on every anchor to work — so the position is computed instead.
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight
      window.scrollTo({ top, behavior: 'instant' })
    }

    // The new route is a different length of page, so every trigger's start and
    // end offsets are stale. Without this the reveals below the fold on the
    // incoming page are measured against the outgoing one's height.
    const settle = () => {
      lenis?.resize()
      ScrollTrigger.refresh()
    }

    if (!hash) {
      jump(0)
      settle()
      return
    }

    const id = requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1))
      jump(target ?? 0)
      settle()
    })

    return () => cancelAnimationFrame(id)
  }, [pathname, hash])

  return null
}
