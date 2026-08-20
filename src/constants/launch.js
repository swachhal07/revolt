// The launch gate's single source of truth. Change the instant here and the
// countdown, the meter, the printed date and the auto-open all follow.

/**
 * The moment the site opens itself: 25 August 2026, 3:00 PM Nepal Standard Time.
 *
 * Written with the offset (+05:45) rather than as a bare local string, so the
 * countdown measures the same instant whether the visitor is in Kathmandu or in
 * Sydney. A bare `2026-08-25T15:00:00` would be parsed against the *browser's*
 * zone, which means a visitor abroad would see the gate lift at their own 3 PM.
 */
export const LAUNCH_AT = new Date('2026-08-25T15:00:00+05:45')

export const GATE = {
  /**
   * The key that lets someone in early.
   *
   * This is a *soft* gate, and it has to be read as one: the check runs in the
   * browser, so the value ships in the bundle and anyone determined enough will
   * find it. It keeps a link out of casual circulation before launch — it does
   * not protect anything. Nothing behind it should be secret.
   *
   * Set `VITE_LAUNCH_PASSWORD` in `.env` to override without touching source.
   */
  password: import.meta.env.VITE_LAUNCH_PASSWORD ?? 'revolt2026',
}
