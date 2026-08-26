import { useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

/**
 * The admin's design system: the instrument cluster.
 *
 * The back office is not a page about the motorcycles — it is the rig the
 * motorcycles are read out on. So it is built as a moulded object under a
 * backlight: cold graphite panels with a machined lip, legends printed in lume,
 * and one live colour. Every screen in here is a binnacle.
 *
 * ── The three rules ────────────────────────────────────────────────────────
 *
 * 1. Volt is signal, red is fault, and nothing else is coloured. Volt marks what
 *    is live, active, focused or committing; brand red appears only when
 *    something is wrong or about to be destroyed. A tool where the accent means
 *    "this is important" everywhere has an accent that means nothing, and on an
 *    instrument the whole point of a lit element is that it is the exception.
 *
 * 2. Depth is edges, not shadows. Elevation is a 1px light catch on the top of a
 *    surface and a 1px shadow under it (`bezel`), or the same pair inverted for
 *    anything sunk into the moulding (`inset-well`). No blurred drop shadows —
 *    that is how a dark theme turns into a stack of floating cards.
 *
 * 3. Type is trimodal, and the gaps carry the hierarchy. `GAUGE` is Oxanium set
 *    large for headings and numerals; `LEGEND` is 10px mono, uppercase, tracked
 *    wide, and carries every label, header, tag and button in the tool; `PROSE`
 *    is the only place Plus Jakarta Sans appears, reserved for the sentences
 *    that actually have to be read as sentences. Three registers, no ladder of
 *    sizes in between.
 *
 * ── The tick rail ──────────────────────────────────────────────────────────
 * The signature. A dial's graduation scale, drawn as two stacked gradients:
 * short minor ticks every 8px and a tall major every 48px. It sits under
 * readouts, along panel feet and beneath the page title, and it is what makes
 * an otherwise ordinary table read as part of an instrument. See `TickRail`.
 */

/* ── Type registers ───────────────────────────────────────────────────────── */

/** Headings and numerals. Oxanium; set a weight, it has three. */
export const GAUGE = 'font-gauge font-bold uppercase leading-[0.88] tracking-[-0.01em]'

/** Labels, headers, tags, buttons, metadata. Everything structural. */
export const LEGEND = 'font-mono text-[10px] font-normal uppercase leading-none tracking-[0.14em]'

/** Figures read as measurements. Tabular so digits stack down a column. */
export const DATA = 'font-mono tabular-nums tracking-[0.01em]'

/** Sentences. The only non-mono, non-gauge text in the admin. */
export const PROSE = 'font-body text-[12.5px] leading-[1.6] text-lume-400'

/* ── Surfaces ─────────────────────────────────────────────────────────────── */

/** The void panels sit in. Also the ground a `grid gap-px` exposes as hairlines. */
export const VOID = 'bg-rig-990'

/** A panel face. */
export const FACE = 'bg-rig-950'

/** The bezel hairline. */
export const EDGE = 'border-rig-700'

/* ── The tick rail ────────────────────────────────────────────────────────── */

/**
 * A dial graduation scale.
 *
 * Two gradients in one element rather than a row of divs: minor ticks are sized
 * to half the element's height and majors to all of it, both anchored to the
 * bottom, so the scale has real hierarchy for the cost of one background.
 *
 * `sweep` runs it out from the left on mount, which is the cheapest possible
 * version of an instrument powering up and the reason it is worth having on the
 * overview at all.
 */
export function TickRail({ className, sweep, delay = 0 }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block h-2.5 w-full origin-left', sweep && 'animate-needle', className)}
      style={{
        animationDelay: sweep ? `${delay}ms` : undefined,
        backgroundImage:
          'linear-gradient(to right, var(--color-lume-600) 0 1px, transparent 1px), linear-gradient(to right, var(--color-rig-700) 0 1px, transparent 1px)',
        backgroundSize: '48px 100%, 8px 50%',
        backgroundPosition: 'left bottom, left bottom',
        backgroundRepeat: 'repeat-x, repeat-x',
      }}
    />
  )
}

/**
 * A status lamp. Volt when live, dark and outlined when not.
 *
 * Square rather than round: everything moulded in this interface has corners,
 * and a circle in it reads as a web component that wandered in.
 */
export function Lamp({ live, alarm, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'size-1.5 shrink-0',
        alarm ? 'animate-blink bg-brand-500' : live ? 'bg-volt-400 lume' : 'bg-rig-700',
        className,
      )}
    />
  )
}

/* ── Actions ──────────────────────────────────────────────────────────────── */

const ACTION_VARIANTS = {
  // The lit control. Volt fill, near-black type — the only element in the tool
  // that is brighter than the text around it, which is precisely what makes it
  // read as the thing to press.
  //
  // `ink-950` rather than `rig-990`: the label has to stay black on volt inside
  // the worksheet too, and `rig-990` is one of the tokens the sheet re-points.
  primary: 'bg-volt-400 text-ink-950 hover:bg-volt-300 hover:lume',
  // Outlined moulding. The default, and quiet enough to repeat in a row.
  default: 'border border-rig-700 bg-rig-900 text-lume-100 bezel hover:border-lume-600 hover:bg-rig-850',
  // No frame until reached. Tertiary actions inside dense rows.
  bare: 'text-lume-600 hover:bg-rig-850 hover:text-lume-100',
  // Fault. The only variant permitted brand red, and it fills only on commit.
  danger: 'border border-brand-500/60 text-brand-400 hover:border-brand-500 hover:bg-brand-600 hover:text-white',
}

const ACTION_SIZES = {
  sm: 'h-7 gap-2 px-2.5',
  md: 'h-9 gap-2.5 px-4',
}

/**
 * The classes an action wears, exposed on their own.
 *
 * Because half the actions in this admin are not buttons. "Open", "Edit" and
 * "Back to the register" all navigate, so they have to be real anchors —
 * copyable, middle-clickable, and openable in a new tab — and a `<button>` that
 * calls `navigate()` is none of those things. Handing out the classes rather
 * than a second `ActionLink` component keeps this file free of a router import,
 * and keeps one definition of what an action looks like.
 */
export function actionClass({ variant = 'default', size = 'md', className } = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[2px]',
    LEGEND,
    // Fast, and colour only. An instrument acknowledges a press; it does not
    // animate itself in response to one.
    'transition-[background-color,border-color,color,box-shadow] duration-100',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-400',
    'disabled:pointer-events-none disabled:opacity-35',
    ACTION_VARIANTS[variant],
    ACTION_SIZES[size],
    className,
  )
}

/**
 * A button.
 *
 * `arrow` appends `▸` — the marker this idiom uses for anything that commits or
 * advances. Type rather than an icon, so it tracks and colours with the word it
 * follows instead of needing its own alignment rules.
 */
export function Action({ variant, size, arrow, className, children, ...props }) {
  return (
    <button type="button" className={actionClass({ variant, size, className })} {...props}>
      {children}
      {arrow && <span aria-hidden="true">▸</span>}
    </button>
  )
}

/* ── Panels ───────────────────────────────────────────────────────────────── */

/**
 * A moulded panel. The admin's only container.
 *
 * 2px of radius, which is not a compromise between sharp and round — it is the
 * radius a moulding tool actually leaves. At 0 the panels read as vector boxes;
 * at 8 they read as a web card, which is the failure mode this whole design is
 * built to avoid.
 */
export function Panel({ className, children, ...props }) {
  return (
    <section
      className={cn('knurl rounded-[2px] border bezel', EDGE, FACE, className)}
      {...props}
    >
      {children}
    </section>
  )
}

/**
 * A panel's header bar: a lamp, a label, a unit reading, and actions.
 *
 * The lamp is doing the work the old idiom's `[ ]` brackets did — separating a
 * 10px tracked label from the 10px tracked data beneath it without spending a
 * fourth type size on the distinction. It is also honest: a panel that is
 * showing something is lit, and a panel reporting a fault is not.
 */
export function PanelHead({ label, unit, alarm, children }) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-t-[1px] border-b bg-rig-900 px-3 py-2.5',
        EDGE,
      )}
    >
      <h2 className={cn(LEGEND, 'flex items-center gap-2.5 text-lume-100')}>
        <Lamp live={!alarm} alarm={alarm} />
        {label}
      </h2>

      <div className="flex items-center gap-3">
        {unit && <span className={cn(LEGEND, DATA, 'text-lume-600')}>{unit}</span>}
        {children}
      </div>
    </header>
  )
}

/** A panel's foot: the strip a repeated commit or an add-row control sits on. */
export function PanelFoot({ className, children }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-b-[1px] border-t bg-rig-900 px-3 py-2.5',
        EDGE,
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * A question the tool asks before it does something you cannot take back.
 *
 * A real `<dialog>`, opened with `showModal()`. That is the whole reason this is
 * fifty lines and not two hundred: the platform gives the focus trap, the
 * Escape key, the inert background and the top layer, and a hand-rolled modal
 * gets those wrong in that order. Escape arrives as `cancel`, which is
 * intercepted so the caller's `open` state and the element's own state cannot
 * disagree — a dialog that closed itself while React still thought it was open
 * would refuse to open a second time.
 *
 * The panel inside is the admin's own: a moulded face, a head with a lamp, and
 * the commit on the foot, which is where every other panel in the tool puts it.
 * The top layer changes where it paints, not what it inherits, so it takes the
 * palette of wherever it is mounted — graphite when the rail raises it, paper
 * when the worksheet does. That is the right way round: a question about the
 * sheet you are writing on belongs to the sheet.
 *
 * Focus lands on Cancel, not on the commit. The reader opened this by pressing
 * something; the safe half of the question should be what a reflexive Return
 * hits.
 */
export function Confirm({
  open,
  title,
  detail,
  confirmLabel = 'Confirm',
  variant = 'primary',
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Guarded both ways: `showModal` on an open dialog throws, and `close` on a
    // shut one fires a stray `close` event.
    if (open && !node.open) node.showModal()
    if (!open && node.open) node.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      // Escape. Prevented so the close goes through the caller's state, which is
      // the only thing that should be deciding whether this is open.
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      // The backdrop is the dialog's own box outside the panel, so a click that
      // lands on the element itself rather than on anything inside it is a click
      // off the dialog. Same dismissal a click outside any of this tool's
      // transient surfaces gets.
      onClick={(event) => {
        if (event.target === ref.current) onCancel()
      }}
      className={cn(
        'm-auto w-[min(30rem,calc(100vw-2rem))] bg-transparent p-0 text-lume-100',
        'backdrop:bg-black/70',
        'open:animate-power-on',
      )}
    >
      <Panel>
        <PanelHead label={title} alarm={variant === 'danger'} />

        {detail && (
          <div className="px-3.5 py-4">
            <p className={cn(PROSE, 'text-lume-400')}>{detail}</p>
          </div>
        )}

        <PanelFoot className={cn(!detail && 'border-t-0')}>
          <Action variant="bare" onClick={onCancel} autoFocus>
            Cancel
          </Action>
          <Action variant={variant} arrow onClick={onConfirm}>
            {confirmLabel}
          </Action>
        </PanelFoot>
      </Panel>
    </dialog>
  )
}

/** A full-width hairline. The alarm variant marks an edge that matters. */
export function Rule({ alarm }) {
  return (
    <hr
      aria-hidden="true"
      className={cn('border-0 border-t', alarm ? 'border-brand-500/70' : 'border-rig-700')}
    />
  )
}

/* ── Controls ─────────────────────────────────────────────────────────────── */

// Sunk into the moulding rather than raised out of it: a field is a well you put
// something into. Focus lights the lip volt and blooms, because on a backlit
// object that is what "this one is receiving input" looks like — a ring would be
// borrowing from a light-theme design system.
const CONTROL = cn(
  'w-full appearance-none rounded-[2px] border bg-rig-900 px-2.5 py-2 text-[13.5px] text-lume-100 inset-well',
  'border-rig-700 placeholder:text-lume-600',
  'transition-[border-color,box-shadow] duration-100',
  'focus:border-volt-400/70 focus:bg-rig-850 focus:outline-none focus:lume',
)

export const CONTROL_CLASS = CONTROL

const INVALID = 'border-brand-500/70 bg-brand-900/25'

export function TextInput({ invalid, className, ...props }) {
  return <input className={cn(CONTROL, invalid && INVALID, className)} {...props} />
}

export function TextArea({ invalid, rows = 3, className, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(CONTROL, 'resize-y leading-relaxed', invalid && INVALID, className)}
      {...props}
    />
  )
}

/**
 * A choice. `appearance-none` strips the native control down to the panel's own
 * well, which also strips the one thing that said it was a choice at all — so
 * the marker is drawn back on: a hairline gate at the right end of the well with
 * a solid caret in it, which is the same construction as the slug field's
 * Generate button and reads as part of the moulding rather than as an icon.
 *
 * `pointer-events-none` on the gate so the whole well stays one click target.
 */
export function Select({ options = [], invalid, className, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(CONTROL, LEGEND, 'h-9 cursor-pointer py-0 pr-11', invalid && INVALID, className)}
        {...props}
      >
        {options.map((option) => (
          // The native menu is drawn by the OS and inherits none of this, so the
          // options are given the panel's own colours explicitly — otherwise a
          // dark control opens a white list on every platform but macOS.
          <option key={option.value} value={option.value} className="bg-rig-900 text-lume-100">
            {option.label}
          </option>
        ))}
      </select>

      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-px right-px flex w-8 items-center justify-center border-l',
          EDGE,
        )}
      >
        <svg viewBox="0 0 8 5" className="w-2 fill-lume-600">
          <polygon points="0,0 8,0 4,5" />
        </svg>
      </span>
    </div>
  )
}

/**
 * Label, help, control, error.
 *
 * The label is `LEGEND`, the same register as a column header and a button — the
 * point of having one metadata register is that a field label and a table header
 * are the same kind of object and should not argue about it.
 *
 * Help sits above the control. Help underneath is read after the field has been
 * filled in, which is too late to be help.
 *
 * The consequence is that two fields side by side have their labels on one line
 * and their wells on two different ones, because one of them has three lines of
 * help and the other has none — and a form's wells are the strongest horizontal
 * line it has. So the field is a full-height column with the control pushed to
 * the foot of it: labels align at the top of the row, wells align at the bottom,
 * and the slack from the uneven help sits in the middle where nothing is lining
 * up with anything anyway.
 */
export function Field({ label, help, error, required, htmlFor, children, className }) {
  return (
    <div className={cn('flex h-full min-w-0 flex-col', className)}>
      <label htmlFor={htmlFor} className={cn(LEGEND, 'flex items-baseline gap-1.5 text-lume-100')}>
        {label}
        {required && (
          <span aria-hidden="true" title="Required" className="text-volt-700">
            •
          </span>
        )}
      </label>

      {help && <p className={cn(PROSE, 'mt-1.5 max-w-[62ch] text-lume-600')}>{help}</p>}

      <div className="mt-auto pt-2">{children}</div>

      {error && (
        <p role="alert" className={cn(LEGEND, 'mt-2 flex items-center gap-2 text-brand-400')}>
          <Lamp alarm />
          {error}
        </p>
      )}
    </div>
  )
}

/* ── Readouts ─────────────────────────────────────────────────────────────── */

const TAG_TONES = {
  neutral: 'border-rig-700 text-lume-400',
  live: 'border-volt-400/40 bg-volt-400/10 text-volt-700',
  draft: 'border-rig-700 bg-rig-850 text-lume-600',
  warn: 'border-brand-500/50 bg-brand-500/10 text-brand-400',
}

/** A status marker: a lamp and a word. Never a filled pill. */
export function Tag({ tone = 'neutral', children }) {
  return (
    <span
      className={cn(
        LEGEND,
        'inline-flex items-center gap-2 rounded-[2px] border px-2 py-1.5',
        TAG_TONES[tone],
      )}
    >
      <Lamp live={tone === 'live'} alarm={tone === 'warn'} />
      {children}
    </span>
  )
}

/**
 * A count, set as a gauge: the numeral at dial scale, its legend above, a tick
 * rail beneath, and the action under that.
 *
 * This is the bimodal contrast at full strength and the one place the admin is
 * allowed to be loud. The rail is not decoration — it is what stops a large
 * number from reading as a marketing statistic.
 */
export function Readout({ value, label, action, delay = 0 }) {
  return (
    <div
      className="animate-power-on flex flex-col gap-5 p-4 sm:p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={cn(LEGEND, 'text-lume-600')}>{label}</span>

      <div>
        <data
          className={cn(
            GAUGE,
            DATA,
            'block font-extrabold text-[clamp(3.25rem,8vw,5.5rem)] tracking-[-0.04em] text-lume-100',
          )}
        >
          {value}
        </data>
        <TickRail sweep delay={delay + 120} className="mt-2" />
      </div>

      {action}
    </div>
  )
}

/**
 * A whole-panel state: loading, empty, or failed.
 *
 * One component for the three because they occupy the same slot, and a screen
 * with a designed empty state but an undesigned error state shows a blank box on
 * the day it matters most. Machine-voiced (`<samp>`), because that is what it is
 * — a cluster reporting on itself.
 */
export function State({ kind = 'empty', title, detail, children }) {
  const marks = { loading: '▮ ▮ ▮', empty: '· · ·', error: '⚠ ⚠ ⚠' }

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <samp
        aria-hidden="true"
        className={cn(
          LEGEND,
          'tracking-[0.4em]',
          kind === 'error' ? 'text-brand-500' : 'text-rig-700',
          kind === 'loading' && 'animate-pulse',
        )}
      >
        {marks[kind]}
      </samp>
      <p className={cn(LEGEND, kind === 'error' ? 'text-brand-400' : 'text-lume-100')}>{title}</p>
      {detail && <p className={cn(PROSE, 'max-w-[48ch] text-lume-600')}>{detail}</p>}
      {children}
    </div>
  )
}
