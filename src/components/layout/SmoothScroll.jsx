import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setLenis } from '@/utils/lenis'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis owns the page's scroll position: the wheel no longer jumps the document
 * by a fixed number of lines, it feeds a value that eases toward the target
 * every frame. That easing is the whole effect — sections arrive with weight
 * instead of snapping into place, and the reveals underneath read as motion
 * rather than as a switch flipping.
 *
 * Two wirings make it safe to build on:
 *
 * - One clock. Lenis and GSAP both want a rAF loop, and two loops means the
 *   scroll position can update after ScrollTrigger has already read it for the
 *   frame, which shows up as reveals firing a frame late. GSAP's ticker drives
 *   Lenis instead, so there is a single ordering: advance the scroll, then run
 *   the tweens. `lagSmoothing(0)` because GSAP's tab-throttling guard would
 *   otherwise clamp the delta it hands us and stall the easing after a
 *   backgrounded tab.
 * - `ScrollTrigger.update` on every Lenis scroll. ScrollTrigger listens to the
 *   native scroll event, which Lenis still emits — but only once per committed
 *   position, so relying on it alone drops frames mid-ease.
 */

export default function SmoothScroll() {
  useEffect(() => {
    // The OS setting is a request not to be moved. Native scrolling is already
    // the reduced-motion answer, so there is nothing to replace it with.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      // Lower lerp is a longer tail. 0.075 is a touch slower to settle than the
      // 0.09 this ran at — still short enough that a flick reaches where it was
      // aimed, long enough that a section arrives rather than appears.
      lerp: 0.075,
      // Distance per wheel notch, and the other half of "slower": easing alone
      // only changes how the page catches up, not how far it is asked to go.
      // 0.85 takes the travel down without making the page feel like it is
      // resisting the wheel — below about 0.7 it starts to read as sticky.
      wheelMultiplier: 0.85,
      // Touch stays native. Smoothing it costs the platform's own rubber-band
      // and momentum, which no lerp reproduces, and adds a frame of latency to
      // the one input that is direct manipulation.
      smoothWheel: true,
      syncTouch: false,
    })

    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)

    const drive = (time) => lenis.raf(time * 1000) // GSAP ticks in seconds
    gsap.ticker.add(drive)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(drive)
      gsap.ticker.lagSmoothing(500, 33) // GSAP's own defaults
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return null
}
