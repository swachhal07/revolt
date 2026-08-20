import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import LaunchGate from './LaunchGate'
import { isUnlocked } from '@/utils/gate'

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
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const open = useCallback(() => setUnlocked(true), [])

  if (!unlocked) return <LaunchGate onUnlock={open} />

  return <Outlet />
}
