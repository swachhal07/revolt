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
 * Does this input open the gate? Trimmed and case-folded, because the key gets
 * passed around by phone and in messages, and a stray capital or a trailing space
 * from a paste is not a wrong answer.
 */
export function checkKey(input) {
  return input.trim().toLowerCase() === GATE.password.trim().toLowerCase()
}
