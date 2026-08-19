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
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const lenis = getLenis()

    const jump = (target) => {
      if (lenis) lenis.scrollTo(target, { immediate: true, force: true })
      else if (target === 0) window.scrollTo({ top: 0, behavior: 'instant' })
      else target.scrollIntoView({ behavior: 'instant', block: 'start' })
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
