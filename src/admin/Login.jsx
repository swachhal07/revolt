import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { signIn } from './data/session'
import { Action, DATA, EDGE, Field, GAUGE, Lamp, LEGEND, PROSE, TextInput, TickRail } from './ui'

/**
 * The sign-in screen: the cluster before the power is on.
 *
 * This is the one screen in the admin that is not yet an instrument — nothing is
 * lit, no channel is selected, no data has been read. So it is staged as the
 * moment before ignition: the housing is there, the legend is printed on it, one
 * lamp is blinking on standby, and the single volt element on the whole screen is
 * the field that will start it.
 *
 * The composition is a centred bay under a masthead rail, with the tick scale
 * running the full width above and below. Centred here and left-aligned
 * everywhere else in the admin on purpose: every other screen is a working
 * surface with a rail down its side, and this one has neither. Its type centres
 * with the bay; the form's own contents do not — a label centred over its own
 * input is a poster rather than a form.
 *
 * Built as a real credential form even though what is behind it is one password
 * compared in the browser: labelled password field, a reveal toggle, a caps-lock
 * warning, a submit that reports its own progress, and an error that names what
 * went wrong and nudges the bay. Swapping in Supabase or an API changes the call
 * inside `handleSubmit` and nothing else.
 */
export default function Login({ onSignedIn }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reveal, setReveal] = useState(false)
  const [caps, setCaps] = useState(false)
  // Toggled on for one animation cycle so a second wrong password replays the
  // shake. Keying the form instead would remount it and drop focus mid-retype.
  const [nudge, setNudge] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy || !password.trim()) return

    setBusy(true)
    setError('')

    try {
      onSignedIn(await signIn(password))
    } catch (failure) {
      setError(failure.message)
      setPassword('')
      setNudge(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-rig-990 font-body text-lume-100">
      {/* Standby backlight: dimmer than the Shell's and thrown from below rather
          than above, so the housing reads as lit from a source that is not yet
          the instrument itself. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 55% at 50% 108%, oklch(26% 0.02 255) 0%, transparent 62%)',
        }}
      />

      <div className="relative flex min-h-dvh flex-col">
        {/* ── Masthead rail ───────────────────────────────────────────────────
            The unit id, the way out, and the session lamp. A tool states what it
            is and what state it is in before it asks for anything.

            The way back to the site belongs here rather than under the form: it
            is the only other place this screen can go, and a visitor who landed
            on it by accident should find that on the frame, not below the thing
            it is refusing them. Same tab — this is a return, not a second
            window; the Shell's "View site ↗" opens a new one because that one is
            a glance from inside a working session. */}
        <header
          className={cn(
            LEGEND,
            'flex items-center justify-between gap-4 border-b bg-rig-950/80 px-4 py-3.5 sm:px-8',
            EDGE,
          )}
        >
          <span className="flex items-center gap-3 text-lume-100">
            <Lamp />
            Revolt / Cluster
          </span>

          <span className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className={cn(
                'flex items-center gap-2 rounded-[2px] px-1.5 py-1 text-lume-600',
                'transition-colors duration-100 hover:text-lume-100',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-400',
              )}
            >
              <span aria-hidden="true">◂</span>
              Back to site
            </Link>

            <span className="hidden items-center gap-2 text-lume-600 sm:flex">
              <Lamp alarm />
              Session — none
            </span>
          </span>
        </header>

        <TickRail className="opacity-50" />

        {/* ── The bay ─────────────────────────────────────────────────────────
            The margin legend only exists where there is margin to spend, so it
            is a `lg` affair: rotated identification down the left edge, the way
            a housing carries its part number on the flank. */}
        <main className="relative flex flex-1 items-center justify-center px-4 py-14 sm:px-8">
          <div
            aria-hidden="true"
            className={cn(
              LEGEND,
              'absolute inset-y-10 left-8 hidden items-center border-l border-rig-700 pl-3.5 lg:flex',
            )}
          >
            <span className="whitespace-nowrap text-lume-600 [writing-mode:vertical-rl]">
              Authorised personnel only — no public route reaches this screen
            </span>
          </div>

          <div className="mx-auto w-full max-w-[27rem] text-center">
            <div className="animate-power-on">
              <span className={cn(LEGEND, 'block text-lume-600')}>Ignition</span>
              <h1
                className={cn(
                  GAUGE,
                  'mt-4 text-[clamp(2.75rem,10vw,4.25rem)] font-extrabold',
                )}
              >
                Access
                <br />
                <span className="text-volt-400">required</span>
              </h1>
            </div>

            <p
              className={cn(PROSE, 'animate-power-on mx-auto mt-5 max-w-[42ch] text-lume-600')}
              style={{ animationDelay: '90ms' }}
            >
              The lineup and the journal are edited from here. Records are the site&rsquo;s own — a
              change to a model page is a change to what a customer reads.
            </p>

            {/* Two elements rather than one because the entrance and the
                wrong-password nudge are both animations, and an element can only
                run one: the wrapper powers on, the bay inside it shakes.
                Toggling the class off on `animationend` is what lets a second
                wrong password replay it. */}
            <div className="animate-power-on mt-9" style={{ animationDelay: '180ms' }}>
              <form
                onSubmit={handleSubmit}
                onAnimationEnd={() => setNudge(false)}
                className={cn(
                  'knurl relative rounded-[3px] border bg-rig-950 p-5 text-left bezel sm:p-6',
                  nudge && 'animate-shake',
                  EDGE,
                )}
              >
                <Field label="Password" error={error} htmlFor="admin-password" required>
                  <div className="relative">
                    <TextInput
                      id="admin-password"
                      type={reveal ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      autoFocus
                      value={password}
                      invalid={Boolean(error)}
                      placeholder="••••••••"
                      className={cn(DATA, 'h-12 pr-20 text-[14px] tracking-[0.3em]')}
                      onKeyUp={(event) => setCaps(event.getModifierState('CapsLock'))}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        if (error) setError('')
                      }}
                    />

                    {/* Inside the field rather than under it: it acts on the
                        field, so it belongs within the same well. */}
                    <button
                      type="button"
                      onClick={() => setReveal((shown) => !shown)}
                      aria-pressed={reveal}
                      className={cn(
                        LEGEND,
                        'absolute inset-y-px right-px rounded-r-[2px] px-3.5 text-lume-600',
                        'transition-colors duration-100 hover:text-lume-100',
                        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-volt-400',
                      )}
                    >
                      {reveal ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </Field>

                {caps && (
                  <p className={cn(LEGEND, 'mt-2.5 flex items-center gap-2 text-lume-400')}>
                    <Lamp />
                    Caps lock is on
                  </p>
                )}

                <Action
                  type="submit"
                  variant="primary"
                  arrow={!busy}
                  disabled={busy || !password.trim()}
                  className="mt-5 h-12 w-full"
                >
                  {busy ? 'Checking' : 'Sign in'}
                </Action>
              </form>
            </div>
          </div>
        </main>

        {/* ── Colophon ────────────────────────────────────────────────────────
            The tick scale closes the screen the way it opened it, and the line
            under it is the build stamp a housing carries moulded into its back. */}
        <footer>
          <TickRail className="rotate-180 opacity-50" />
          <div
            className={cn(
              LEGEND,
              DATA,
              'flex items-center justify-between gap-4 px-4 py-3.5 text-lume-600 sm:px-8',
            )}
          >
            <span>Rev-CTL / 01</span>
            <span className="hidden sm:inline">Local credential check — no network</span>
            <span>Form 01 of 01</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
