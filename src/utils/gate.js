import { GATE, LAUNCH_AT } from '@/constants/launch'

/**
 * Is the site open? True only once the launch instant has passed, at which point
 * the gate is over for everyone.
 *
 * A key typed on the gate is deliberately *not* remembered: it unlocks the tab
 * it was typed in and nothing more, so every reload and every new tab lands back
 * on the countdown. That is the useful behaviour before launch — the gate is the
 * page, and a visitor who has seen it once should still see it — and it is also
 * the honest one, since a persisted flag in `localStorage` is trivially settable
 * by hand and would hand out a permanent bypass to anyone who looked.
 *
 * Read synchronously during the first render, so once launch has passed the site
 * paints straight through instead of flashing the gate for a frame.
 */
export function isUnlocked() {
  return Date.now() >= LAUNCH_AT.getTime()
}

/**
 * The dev-only `?reveal` flag, or null: the door onto the price reveal, which is
 * otherwise a screen that happens once per tab and cannot be returned to.
 *
 * It lives here rather than in [[Hero]] because two components need the same
 * answer — the gate has to stand aside so the home page mounts at all, and the
 * hero has to know to show the reveal — and a URL flag read in two places is a
 * flag that eventually disagrees with itself.
 *
 * `import.meta.env.DEV` is substituted at build time, so this returns null on the
 * first line in production and the callers' branches are dropped with it. The
 * flag cannot be turned on against a live site.
 *
 * Bare `?reveal` uses the catalogue's own price; `?reveal=525000` supplies a
 * stand-in for previewing before a real figure exists. See [[Hero]], which is
 * where the value is interpreted.
 */
export function revealPreview() {
  if (!import.meta.env.DEV) return null
  return new URLSearchParams(window.location.search).get('reveal')
}

/**
 * Did the gate lift while this page was open?
 *
 * Module state, not storage, and deliberately: it is a hand-off between two
 * components in the same tree — the gate that just lifted and the hero that is
 * about to mount behind it — and it is only ever true for the one page load in
 * which the transition happened. A visitor who arrives after launch never sees
 * the gate, so nothing sets this, and the hero opens straight onto the film.
 *
 * It exists because unlocking is not a navigation: the URL does not change and
 * the hero mounts with no way of telling a fresh visit from the instant the
 * countdown ran out. See [[PriceReveal]], which is the whole reason it is here.
 *
 * `clearGateLift` is called by whoever acts on it, so a later remount of the
 * hero — someone navigating away from home and back — does not replay the
 * moment. The read is separate from the clear so the consumer can read it during
 * render (before the film has a chance to start) and clear it in an effect.
 */
let lifted = false

export function markGateLift() {
  lifted = true
}

export function gateJustLifted() {
  return lifted
}

export function clearGateLift() {
  lifted = false
}

/**
 * Does this input open the gate? Trimmed and case-folded, because the key gets
 * passed around by phone and in messages, and a stray capital or a trailing space
 * from a paste is not a wrong answer.
 */
export function checkKey(input) {
  return input.trim().toLowerCase() === GATE.password.trim().toLowerCase()
}
