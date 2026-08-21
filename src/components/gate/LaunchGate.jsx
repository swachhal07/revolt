import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { LAUNCH_AT } from '@/constants/launch'
import { useCountdown } from '@/hooks/useCountdown'
import { checkKey } from '@/utils/gate'
import { cn } from '@/utils/cn'

// The four groups of the clock, in the order a telemetry strip prints them.
const CHANNELS = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hrs' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Sec' },
]

// Every hairline on the gate. One constant, because the whole design is made of
// this single line weight and a chassis whose borders disagree by a percent of
// opacity stops reading as one machined part.
const RULE = 'border-white/25'

// Micro-typography, unchanged wherever it appears: small, fixed, tracked wide
// enough to read as a terminal matrix rather than as prose.
const MICRO = 'text-[10px] uppercase leading-none tracking-[0.3em] sm:text-[11px]'

/**
 * The pre-launch gate. Occupies the whole viewport in front of the site until
 * either the clock runs out or the visitor types the access key.
 *
 * Tactical telemetry, committed to end to end: one dark substrate, one accent
 * (the brand's own red, which is already the hazard red this idiom wants),
 * monospace for every glyph, and not one rounded corner anywhere. No gradients,
 * no translucency, no soft shadows — depth comes from hairlines and from
 * simulated hardware over the black, which is how a physical panel gets it.
 *
 * The hierarchy is deliberately bimodal, and that is the whole design: one macro
 * element (the clock, set as large as the chassis will physically carry) against
 * everything else compressed to 10px tracked metadata. The headline is metadata
 * here rather than a heading — at a competing size it fought the numerals, and in
 * this idiom the readout is supposed to win.
 *
 * `onUnlock` is called after the exit, so the site does not pop in under a gate
 * that is still on screen.
 */
export default function LaunchGate({ onUnlock }) {
  const left = useCountdown(LAUNCH_AT)
  const [leaving, setLeaving] = useState(false)

  // The exit is one-way and idempotent: a second call while it is already running
  // (the clock hitting zero a beat after a correct key, say) must not restart it
  // or schedule a second `onUnlock`.
  const leavingRef = useRef(false)
  const lift = useCallback(() => {
    if (leavingRef.current) return
    leavingRef.current = true
    setLeaving(true)
    setTimeout(onUnlock, 200)
  }, [onUnlock])

  // Launch reached while someone is sat on the page — the gate lifts itself
  // rather than making them reload to discover the site is live.
  useEffect(() => {
    if (left.done) lift()
  }, [left.done, lift])

  // The gate is the only thing on screen, so the document behind it must not
  // scroll. Lenis is not running yet (it mounts with the site's layout), so this
  // is the whole of the lock.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] overflow-y-auto bg-ink-950 p-3 font-mono text-white sm:p-5',
        // A hard cut, not a dissolve. A terminal releasing a lock cuts.
        'transition-opacity duration-200 ease-linear',
        leaving && 'pointer-events-none opacity-0',
      )}
    >
      <Hardware />

      {/* The chassis: one bordered box that always fills the viewport, so the gate
          reads as a panel bolted to the screen rather than as content sitting on
          a page. */}
      <div
        className={cn(
          'relative flex min-h-[calc(100dvh-1.5rem)] flex-col border sm:min-h-[calc(100dvh-2.5rem)]',
          RULE,
        )}
      >
        <Registration />

        <StatusRail />

        <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-3 py-12 sm:gap-12 sm:px-6">
          {/* The headline, demoted to a stencilled caption: it labels the readout
              rather than competing with it. Unframed — the ASCII brackets that
              used to hold it were as heavy as the words they framed. */}
          <h1 className={cn(MICRO, 'text-center text-white')}>New Revolt Coming soon</h1>

          <Clock left={left} />
        </main>

        <AccessRail onPass={lift} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * Simulated hardware, fixed to the viewport and stacked cheapest first: the
 * electron sweep, then grain over it. Both are near-invisible alone, and the pair
 * is what stops a full screen of #050505 from looking like a switched-off panel.
 *
 * `transform-gpu` is not decoration here. Both layers cover the viewport and the
 * grain blends with what is underneath, so without its own compositor layer every
 * repaint below — the clock changing, a hover on the access rail — drags the
 * full-screen blend through the paint step with it. Promoting it once means the
 * texture is rasterised a single time and thereafter only composited.
 */
function Hardware() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 transform-gpu">
      <div className="scanlines absolute inset-0 opacity-70" />
      <div className="grain absolute inset-0 opacity-[0.09] mix-blend-overlay" />
    </div>
  )
}

/** Registration marks straddling the chassis corners. Purely structural. */
function Registration() {
  const spots = [
    'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
    'right-0 top-0 translate-x-1/2 -translate-y-1/2',
    'left-0 bottom-0 -translate-x-1/2 translate-y-1/2',
    'right-0 bottom-0 translate-x-1/2 translate-y-1/2',
  ]

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {spots.map((spot) => (
        <span
          key={spot}
          className={cn(
            'absolute flex size-3 items-center justify-center text-[13px] leading-none text-white',
            spot,
          )}
        >
          +
        </span>
      ))}
    </div>
  )
}

/**
 * The chassis's top rail: the partnership lockup, and the lock state.
 *
 * The lockup keeps the rail's micro scale rather than being set as a logo — at
 * this size, tracked type *is* the industrial marker. The joining `x` is left at
 * the body weight and lower case against the two names' 800, which is what makes
 * it read as a join rather than as a letter inside one long word.
 *
 * `LOCKED` is the one piece of machine state on the gate, and it is here because
 * it answers the question the screen provokes: the site is not broken, it is held.
 */
function StatusRail() {
  return (
    <div
      className={cn(
        'relative flex items-center justify-between gap-4 border-b px-4 py-4 sm:px-6',
        RULE,
      )}
    >
      <span className={cn(MICRO, 'font-extrabold normal-case text-white')}>
        Dugar
        <span className="font-normal lowercase opacity-60">x</span>
        Revolt
      </span>
      <span className={cn(MICRO, 'flex items-center gap-2.5 text-white')}>
        Locked
        <span aria-hidden="true" className="animate-blink text-[9px] text-brand-600">
          ■
        </span>
      </span>
    </div>
  )
}

/**
 * The clock as one monolithic strip — `05:03:21:39` — rather than four cards.
 *
 * Cards made four objects out of one instrument, and the borders around them
 * fought the chassis they sat in. One strip is a single macro element, which is
 * what the bimodal hierarchy needs, and the colons carry the rhythm the borders
 * used to.
 *
 * Every column mirrors the same structure — glyph row, then a fixed-height
 * caption row — so the separators sit on the digits' baseline without a magic
 * offset. The caption row is why the colons render an empty span rather than
 * nothing.
 */
function Clock({ left }) {
  return (
    <div
      className="relative flex items-start justify-center"
      // Polite, not assertive: a screen reader announcing every second would make
      // the page unusable, so the region is only read when focus lands on it.
      role="timer"
      aria-live="off"
      aria-label={`Time remaining: ${left.days} days, ${left.hours} hours, ${left.minutes} minutes, ${left.seconds} seconds`}
    >
      {CHANNELS.map((channel, index) => (
        <Fragment key={channel.key}>
          {index > 0 && <Separator />}
          <Group value={left[channel.key]} label={channel.label} live={channel.key === 'seconds'} />
        </Fragment>
      ))}
    </div>
  )
}

// The scale of the strip, shared by the digits and the colons so they can never
// drift apart.
//
// Tuned to the string it has to carry: eight numerals at roughly a 0.55em advance
// plus three separators at ~0.4em (glyph plus its padding) is under 6em, which has
// to clear the chassis's own padding at both ends. Chakra Petch is a narrow face,
// so both ends of the clamp run wider than a grotesque could — 12vw is the largest
// term that still holds one line inside a 360px phone, and 13rem is where the strip
// stops growing on a desktop it would otherwise outgrow.
//
// `font-plate` rather than a token of its own: this is the same Chakra Petch the
// motorcycle pages set a model name in, for the same reason — the site's body face
// goes flat above ~4rem and type this large wants angles. One token, so swapping
// the face later stays a one-line change.
//
// `leading-[0.8]` is load-bearing beyond the digits — `Separator` measures its box
// against it to centre the colon, so the two have to read the same value.
const STRIP = 'font-plate text-[clamp(2.25rem,12vw,13rem)] leading-[0.8] tracking-[-0.02em]'

function Group({ value, label, live }) {
  const text = String(value).padStart(2, '0')

  return (
    <div className="flex flex-col items-center">
      {/* 700, which is the top of what Chakra Petch is loaded at — asking for 800
          would get a browser-synthesised fake bold rather than a heavier cut. */}
      <div className={cn('flex font-bold tabular-nums text-white', STRIP)}>
        {text.split('').map((digit, index) => (
          // `w-[1ch]` is what stops the whole strip sliding sideways every time a
          // number changes. Chakra Petch's figures are not uniform-width and it
          // carries no `tnum` feature for `tabular-nums` to switch on, so a 1
          // taking the place of a 4 made the row narrower — and because the row is
          // centred, both halves of the clock moved. One `ch` is by definition the
          // advance of a zero in the current font, so every digit sits in an
          // identical cell and the strip's width is fixed no matter what it reads.
          //
          // Deliberately NOT animated, and deliberately keyed by position only.
          // Each digit used to be keyed by its value so a change remounted it and
          // replayed a 0.16s fade-and-rise — a mechanical tick, and far too
          // expensive for what it was: it repainted a glyph up to 13rem tall every
          // second, underneath a full-screen `mix-blend-mode` layer that then had
          // to re-composite the entire viewport. On anything but a fast GPU that
          // reads as the clock stuttering. A counter that changes cleanly is worth
          // more here than one that flourishes.
          <span key={index} className="inline-block w-[1ch] text-center">
            {digit}
          </span>
        ))}
      </div>

      <div className={cn('mt-4 flex items-center gap-2 whitespace-nowrap sm:mt-6', MICRO)}>
        <span className="text-white">{label}</span>
        {/* The only accent on the screen, and it earns it by marking the only
            channel that is actually moving. */}
        {live && (
          <span aria-hidden="true" className="animate-blink text-[9px] text-brand-600">
            ■
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * The colon between two groups. Mirrors `Group`'s two-row structure so the rows
 * below stay aligned.
 *
 * It reads as punctuation rather than as another glyph through scale and weight
 * together: half the numerals' size, and 600 against their 700 — Chakra Petch is
 * loaded at both, so this contrast is real rather than synthesised. It is centred
 * inside a box exactly `leading-[0.8]` tall — the digits' own line box — which puts
 * it on the numerals' optical middle without a hand-tuned offset. The padding is
 * in `em` so the whole separator scales with the clamp.
 */
function Separator() {
  return (
    <div aria-hidden="true" className="flex flex-col items-center">
      <div className={cn('flex h-[0.8em] items-center px-[0.14em] font-semibold text-white', STRIP)}>
        <span className="text-[0.5em] leading-none">:</span>
      </div>
      <span className={cn('mt-4 block sm:mt-6', MICRO)} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * The early-access key, as the chassis's bottom rail.
 *
 * Closed, it is a single full-width bar — the widest, lowest element on screen,
 * which is where a terminal puts its command line. It inverts on hover (white
 * ground, black type) rather than tinting, because a tint needs a soft fill and
 * this palette does not have one. Open, the same rail grows the field and the
 * unlock key without moving anything above it.
 */
function AccessRail({ onPass }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('idle') // idle | checking | wrong
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const submit = (event) => {
    event.preventDefault()
    if (status === 'checking' || !value.trim()) return

    setStatus('checking')

    // A deliberate beat before the verdict. It gives the interaction weight, and
    // it takes the edge off typing keys at machine speed — the check itself is
    // local and instant, which would otherwise let a wrong guess be retried as
    // fast as the keyboard allows.
    setTimeout(() => {
      if (checkKey(value)) {
        setStatus('idle')
        onPass()
        return
      }

      setStatus('wrong')
      setValue('')
      inputRef.current?.focus()
      // Restart the shake even if it is already running, so a second wrong key in
      // a row still answers.
      setShake(false)
      requestAnimationFrame(() => setShake(true))
    }, 420)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group relative flex w-full items-center justify-between gap-4 border-t px-4 py-5 text-left sm:px-6 sm:py-6',
          RULE,
          MICRO,
          'text-white transition-colors duration-150 ease-linear',
          'hover:bg-white hover:text-ink-950 focus-visible:bg-white focus-visible:text-ink-950 focus-visible:outline-none',
        )}
      >
        <span>[ Auth ]</span>
        <span className="hidden sm:inline">Enter access key</span>
        {/* The chevrons step right on hover — the one non-structural motion in the
            design, and it moves by a hair. */}
        <span
          aria-hidden="true"
          className="tracking-[0.1em] transition-transform duration-150 ease-linear group-hover:translate-x-1 group-focus-visible:translate-x-1"
        >
          &gt;&gt;&gt;
        </span>
      </button>
    )
  }

  return (
    <form
      onSubmit={submit}
      onAnimationEnd={() => setShake(false)}
      className={cn('relative border-t px-4 py-5 sm:px-6 sm:py-6', RULE, shake && 'animate-shake')}
    >
      <div className={cn('flex items-center justify-between gap-4 text-white', MICRO)}>
        <span>[ Auth ] Access key</span>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setStatus('idle')
            setValue('')
          }}
          className="tracking-[0.3em] text-white transition-opacity duration-150 hover:opacity-60 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          [ Esc ]
        </button>
      </div>

      {/* `gap-px` over a lit parent draws the divider between field and key: one
          hairline, rather than the doubled edge two borders would meet at. */}
      <div className="mt-4 flex flex-col gap-px bg-white/25 sm:flex-row">
        <label htmlFor="gate-key" className="sr-only">
          Access key
        </label>
        <input
          ref={inputRef}
          id="gate-key"
          name="gate-key"
          type="password"
          autoComplete="off"
          spellCheck="false"
          value={value}
          placeholder="••••••••"
          onChange={(event) => {
            setValue(event.target.value)
            if (status === 'wrong') setStatus('idle')
          }}
          aria-invalid={status === 'wrong'}
          aria-describedby="gate-key-status"
          className={cn(
            'flex-1 bg-ink-950 px-4 py-4 text-[15px] tracking-[0.3em] text-white',
            // The placeholder is the one glyph left holding an opacity: at full
            // white a row of dots reads as a value already in the field.
            'placeholder:text-white/45 focus:bg-white/[0.06] focus:outline-none',
          )}
        />
        <button
          type="submit"
          disabled={status === 'checking' || !value.trim()}
          className={cn(
            'shrink-0 bg-brand-600 px-8 py-4 text-white',
            MICRO,
            'transition-colors duration-150 ease-linear hover:bg-white hover:text-ink-950',
            'disabled:pointer-events-none disabled:bg-ink-950 disabled:text-white/40',
            'focus-visible:bg-white focus-visible:text-ink-950 focus-visible:outline-none',
          )}
        >
          {status === 'checking' ? 'Unlocking…' : 'Unlock'}
        </button>
      </div>

      {/* A reserved output line rather than a conditional block, so a wrong key
          does not jog the rail taller by the height of a sentence. Red, and the
          only red type on the gate: it is the one line that has to read as a
          failure. */}
      <output
        id="gate-key-status"
        role="alert"
        className={cn(
          'mt-3 block min-h-4 text-[10px] uppercase leading-none tracking-[0.3em] transition-opacity duration-150',
          status === 'wrong' ? 'text-brand-600 opacity-100' : 'opacity-0',
        )}
      >
        &gt;&gt;&gt; Access denied — key rejected
      </output>
    </form>
  )
}
