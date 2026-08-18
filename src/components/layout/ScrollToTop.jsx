import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Client-side navigation keeps scroll position by default; reset it on route
 * change.
 *
 * A hash is the exception: `/#questions` from another route is a request for a
 * section, and scrolling to the top of the page instead silently drops the
 * request. The element does not exist until the new route has painted, so the
 * lookup waits a frame; if it still is not there, the top is the safe answer.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }

    const id = requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1))
      if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    })

    return () => cancelAnimationFrame(id)
  }, [pathname, hash])

  return null
}
