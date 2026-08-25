import { useCallback, useLayoutEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import LaunchGate from './LaunchGate'
import { isUnlocked, markGateLift, revealPreview } from '@/utils/gate'
import { getLenis } from '@/utils/lenis'

/**
 * Holds the public site shut until launch.
 *
 * This used to sit in `App`, above the router, which gated every address the app
 * had — including `/admin`, which is why it moved. As a route element it wraps
 * only the branch it is a parent of, so the admin can be mounted as a sibling and
 * reached before launch. Nothing about the gate itself changed.
 *
 * The pages behind it stay unmounted while it is up, exactly as before: `Outlet`
 * renders nothing until the gate lifts, so no page's effects run — no Lenis, no
 * scroll listeners, no video preloads — for a screen nobody can see.
 */
export default function GateGuard() {
  // Resolved during the first render, not in an effect: once launch has passed the
  // site paints straight through instead of flashing the gate for a frame.
  //
  // State only, with nothing behind it — a key typed on the gate holds for this
  // page load and no longer, so a reload lands back on the countdown.
  //
  // `?reveal` opens the gate in dev, because the screen it previews lives behind
  // it: without this, looking at the price reveal means typing the access key on
  // every reload. It is a build-time-erased flag, so it cannot open anything in
  // production — see `revealPreview` in [[gate]].
  const [unlocked, setUnlocked] = useState(() => isUnlocked() || revealPreview() != null)

  // The lift is marked here rather than inside the gate because this is the only
  // place that knows the difference between the gate lifting and the site simply
  // being open: a visitor arriving after launch initialises `unlocked` to true
  // above and this never runs. [[Hero]] reads it to decide whether the price
  // reveal is owed.
  const open = useCallback(() => {
    markGateLift()
    setUnlocked(true)
  }, [])

  // The site opens at the top, whatever the gate was doing.
  //
  // Unlocking is not a navigation — the URL does not change — so [[ScrollToTop]]
  // never fires, and the window keeps whatever scroll position the gate left
  // behind. Anyone who scrolled the countdown to reach the key field, or nudged
  // it on a phone where the gate runs past a short viewport, landed on the home
  // page part-way down the hero.
  //
  // `useLayoutEffect`, so it happens in the same commit that mounts the site
  // rather than a frame later: a passive effect here shows one painted frame of
  // the page at the old offset and then jumps.
  //
  // Both scrollers, because at this instant it is not certain which is driving.
  // Lenis mounts inside the tree this is about to render, and a child's effects
  // run before this one — so it may already be live and holding its own idea of
  // the position, which `window.scrollTo` alone would not correct.
  // And the browser's own restore is turned off before any of that can matter.
  // On a reload it remembers where the reader was, finds a document one
  // viewport tall because the gate is all there is, and re-applies the offset
  // the moment the real page mounts and the document grows — which is the same
  // symptom arriving by a different route, and the one a scroll reset cannot
  // pre-empt because it happens afterwards. The site sets its own position on
  // every navigation anyway; see [[ScrollToTop]].
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
  }, [])

  useLayoutEffect(() => {
    if (!unlocked) return

    window.scrollTo(0, 0)
    getLenis()?.scrollTo(0, { immediate: true, force: true })
  }, [unlocked])

  if (!unlocked) return <LaunchGate onUnlock={open} />

  return <Outlet />
}
