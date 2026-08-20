import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { signIn } from './backend/session'
import { Action, Barcode, Crosshair, DATA, EDGE, Field, MACRO, MICRO, TextInput } from './ui'

/**
 * The sign-in sheet.
 *
 * A single left-aligned column between two rails, rather than a centred stack
 * floating in the middle of an empty sheet.
 *
 * The centred version put a centred headline over a left-aligned form, which is
 * two axes arguing, and left the top and bottom thirds of the viewport as blank
 * paper. The fix is not to re-introduce the asymmetric two-column composition —
 * that genuinely did push the only interactive element off to one side — but to
 * *frame* the column: a masthead rail at the top, a hazard rule and colophon at
 * the bottom, and a margin stripe down the left on wide screens. The sheet now
 * reads as a page of a document with one form on it, and every edge of the
 * viewport is registered.
 *
 * The plate keeps the two-word break but sets flush left against the form's own
 * left edge, so headline, rule, label, input and button all hang from one line.
 * `REQUIRED` gets the hazard slab behind it — the one place this screen spends
 * colour, and it prints itself left-to-right on load so the page has a single
 * entrance rather than a scatter of them.
 *
 * Built as a real credential form even though what is behind it is one password
 * compared in the browser: labelled password field, a reveal toggle, a caps-lock
 * warning, a submit that reports its own progress, and an error that names what
 * went wrong and nudges the frame. Swapping in Supabase or an API changes the
 * call inside `handleSubmit` and nothing else.
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
    <div className="halftone relative min-h-dvh overflow-hidden bg-news-100 font-body text-ink-950">
      <div
        aria-hidden="true"
        className="grain pointer-events-none fixed inset-0 opacity-[0.35] mix-blend-multiply"
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
            MICRO,
            'flex items-center justify-between gap-4 border-b bg-news-200 px-4 py-3 sm:px-8',
            EDGE,
          )}
        >
          <span className="flex items-center gap-3 text-ink-950">
            <span aria-hidden="true" className="text-ink-950/40">
              [{' '}
            </span>
            Revolt / Control
            <span aria-hidden="true" className="text-ink-950/40">
              {' '}]
            </span>
            <Barcode className="hidden w-16 sm:block" />
          </span>

          <span className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className={cn(
                'flex items-center gap-2 px-1 py-1 text-ink-950/70',
                'transition-colors duration-100 hover:bg-ink-950 hover:text-news-100',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
              )}
            >
              <span aria-hidden="true">&lt;&lt;&lt;</span>
              Back to site
            </Link>

            <span className="hidden items-center gap-2 text-ink-950/55 sm:flex">
              <span aria-hidden="true" className="animate-blink size-1.5 bg-brand-600" />
              Session — none
            </span>
          </span>
        </header>

        {/* ── The sheet ───────────────────────────────────────────────────────
            The margin stripe only exists where there is margin to spend, so it
            is a `lg` affair: rotated identification down the left edge, the way
            a bound document carries its title on the spine. */}
        <main className="relative flex flex-1 items-center justify-center px-4 py-14 sm:px-8">
          <div
            aria-hidden="true"
            className={cn(
              MICRO,
              'absolute inset-y-8 left-8 hidden items-center border-l border-ink-950/25 pl-3 lg:flex',
            )}
          >
            <span className="whitespace-nowrap text-ink-950/35 [writing-mode:vertical-rl]">
              Authorised personnel only — no public route reaches this screen
            </span>
          </div>

          {/* Centred on both axes of the sheet. The type centres with it; the
              form's own contents do not — a label centred over its own input is
              a poster rather than a form. */}
          <div className="mx-auto w-full max-w-[27rem] text-center">
            <h1
              className={cn(
                MACRO,
                'animate-rise text-[clamp(3rem,11vw,4.75rem)]',
              )}
            >
              Access
              <br />
              <span className="relative inline-block px-[0.12em]">
                <span
                  aria-hidden="true"
                  className="animate-sweep absolute inset-0 origin-left bg-brand-600"
                  style={{ animationDelay: '340ms' }}
                />
                <span className="relative text-news-100 mix-blend-normal">required</span>
              </span>
            </h1>

            <p
              className="animate-rise mx-auto mt-6 max-w-[42ch] text-[13.5px] leading-relaxed text-ink-950/60"
              style={{ animationDelay: '90ms' }}
            >
              The lineup and the journal are edited from here. Records are the site&rsquo;s own —
              a change to a model page is a change to what a customer reads.
            </p>

            {/* The frame is the form's only container; the crosshairs register
                it against the sheet.

                Two elements rather than one because the entrance and the
                wrong-password nudge are both animations, and an element can
                only run one: the wrapper rises on load, the frame inside it
                shakes. Toggling the class off on `animationend` is what lets a
                second wrong password replay it. */}
            <div className="animate-rise mt-9" style={{ animationDelay: '180ms' }}>
              <form
                onSubmit={handleSubmit}
                onAnimationEnd={() => setNudge(false)}
                className={cn(
                  'relative border bg-news-100 p-5 text-left sm:p-6',
                  nudge && 'animate-shake',
                  EDGE,
                )}
              >
                <Crosshair className="left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
                <Crosshair className="right-0 top-0 translate-x-1/2 -translate-y-1/2" />
                <Crosshair className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
                <Crosshair className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

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
                      className={cn(MICRO, 'h-12 pr-20 text-[13px] tracking-[0.3em]')}
                      onKeyUp={(event) => setCaps(event.getModifierState('CapsLock'))}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        if (error) setError('')
                      }}
                    />

                    {/* Inside the field rather than under it: it acts on the
                        field, so it belongs on the same rule. */}
                    <button
                      type="button"
                      onClick={() => setReveal((shown) => !shown)}
                      aria-pressed={reveal}
                      className={cn(
                        MICRO,
                        'absolute inset-y-px right-px px-3 text-ink-950/50',
                        'transition-colors duration-100 hover:bg-ink-950 hover:text-news-100',
                        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600',
                      )}
                    >
                      {reveal ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </Field>

                {caps && (
                  <p className={cn(MICRO, 'mt-2 text-ink-950/60')}>
                    <span aria-hidden="true">/// </span>
                    Caps lock is on
                  </p>
                )}

                <Action
                  type="submit"
                  variant="primary"
                  chevrons={!busy}
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
            The hazard rule marks the bottom edge of the document; the line under
            it is the build stamp a printed manual carries in the same place. */}
        <footer>
          <hr aria-hidden="true" className="hazard h-1 border-0" />
          <div
            className={cn(
              MICRO,
              DATA,
              'flex items-center justify-between gap-4 px-4 py-3 text-ink-950/45 sm:px-8',
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
