import { useEffect, useRef, useState } from 'react'

function split(target) {
  const ms = Math.max(0, target - Date.now())
  // The whole-second value the readout is showing. Everything below is derived
  // from it, so it is also the only thing worth comparing two samples by.
  const total = Math.floor(ms / 1000)

  return {
    ms,
    total,
    done: ms === 0,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

// How often the target is sampled. Five times a second, which is well inside the
// resolution being displayed — the point is that no single wake-up matters, so
// there is no instant for a late or coalesced timer to miss.
const POLL = 200

/**
 * Time left until `target` (a Date), split into days/hours/minutes/seconds and
 * re-rendered once per second until it runs out.
 *
 * This polls rather than trying to wake exactly on each second boundary, and that
 * is the entire design. Boundary scheduling — `setTimeout` for precisely the
 * remainder to the next second — is the obvious build and it is fragile in a way
 * that is plainly visible on screen: `setTimeout` guarantees a *minimum* delay,
 * not an instant, and a browser is free to coalesce timers, clamp them under load,
 * throttle them in a hidden tab, or fire one a millisecond early. Every one of
 * those either freezes the readout for two beats and then skips a number, or
 * drifts it away from the visitor's own clock.
 *
 * Sampling five times a second removes the failure mode instead of compensating
 * for it. No individual wake-up is load-bearing: if one is late, dropped or
 * coalesced, the next one is still inside the same second and the readout is still
 * correct, because every sample is computed from the target rather than counted
 * down from the last one. Drift is not possible — there is nothing accumulating.
 *
 * It costs a subtraction and a comparison per wake-up, and it renders exactly as
 * often as the display changes: state is replaced only when the whole-second value
 * moves, so four of every five samples do nothing at all.
 *
 * A tab restored from the background resyncs immediately on `visibilitychange`
 * rather than waiting out the throttled interval, so it never shows a stale number
 * on return.
 *
 * Stops polling once it reaches zero — a finished countdown has no reason to keep
 * waking the main thread.
 */
export function useCountdown(target) {
  const [left, setLeft] = useState(() => split(target))

  // The last whole second committed to state. A ref, not `left`, so `sync` can
  // compare against it without the effect having to re-run every second to close
  // over a fresh value.
  const seenRef = useRef(left.total)

  // `left.done` is false for the whole life of a running countdown, so this effect
  // runs once and then exactly once more, on the flip to zero, to stop the poll.
  useEffect(() => {
    if (left.done) return

    const sync = () => {
      const next = split(target)
      if (next.total === seenRef.current) return
      seenRef.current = next.total
      setLeft(next)
    }

    const id = setInterval(sync, POLL)
    document.addEventListener('visibilitychange', sync)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [target, left.done])

  return left
}
