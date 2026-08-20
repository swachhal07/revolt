import { cn } from '@/utils/cn'

/**
 * The admin's design system: Swiss industrial print.
 *
 * One substrate, committed to absolutely — matte unbleached paper, carbon ink,
 * and hazard red as the only other colour in the building. No gradients, no
 * translucent fills, no shadows, and not one rounded corner. Every apparent
 * elevation is a hairline instead, because a printed manual has no z-axis.
 *
 * The type is bimodal by design and the gap between the two registers is the
 * whole hierarchy: `MACRO` is a heavy grotesque set enormous and tracked tight
 * enough that the glyphs form blocks; `MICRO` is 10–11px monospace, uppercase,
 * tracked wide, and carries *everything* else — labels, headers, metadata, unit
 * IDs, button text. There is deliberately almost nothing in between. A tool with
 * six type sizes looks designed by committee; this one has two and a body size.
 *
 * ── The hairline technique ─────────────────────────────────────────────────
 * Rules are drawn with `grid gap-px` over a carbon ground rather than with
 * borders: children painted `bg-news-100` sit on `bg-ink-950` and the gap is the
 * ground showing through. One hairline between neighbours, always exactly 1px at
 * any zoom, and no doubled edge where two bordered boxes meet. `SHEET` and `CELL`
 * below are that pair.
 */

/* ── Type registers ───────────────────────────────────────────────────────── */

/** Structural headings. Never smaller than this; never given a weight utility. */
export const MACRO = 'font-macro uppercase leading-[0.9] tracking-[-0.03em]'

/** Everything else. Labels, headers, metadata, actions, unit IDs. */
export const MICRO = 'font-mono text-[10px] uppercase leading-none tracking-[0.09em]'

/** Numbers that are read as measurements rather than as prose. */
export const DATA = 'font-mono tabular-nums tracking-[0.02em]'

/* ── The hairline pair ────────────────────────────────────────────────────── */

/** The carbon ground a grid's gaps expose. Apply with `grid gap-px`. */
export const SHEET = 'bg-ink-950'

/** A cell sitting on that ground. */
export const CELL = 'bg-news-100'

/** For the few places a real border is unavoidable (a single element, no grid). */
export const EDGE = 'border-ink-950/85'

/* ── Actions ──────────────────────────────────────────────────────────────── */

const ACTION_VARIANTS = {
  // Carbon block, paper type. The primary action is the darkest thing in its
  // zone, which on a light substrate is how "primary" is stated without colour.
  primary: 'bg-ink-950 text-news-100 hover:bg-brand-600',
  // Outlined. The default, and quiet enough to repeat.
  default: 'border border-ink-950/85 bg-transparent text-ink-950 hover:bg-ink-950 hover:text-news-100',
  // No frame until it is reached. For tertiary actions in dense rows.
  bare: 'text-ink-950/70 hover:bg-ink-950 hover:text-news-100',
  // Hazard red, and the only element permitted to use it as a fill.
  danger: 'border border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-news-100',
}

const ACTION_SIZES = {
  sm: 'h-7 gap-2 px-2.5',
  md: 'h-9 gap-2.5 px-4',
}

/**
 * A button.
 *
 * `chevrons` appends `>>>` — the directional marker this idiom uses for anything
 * that commits or advances. It is on the label rather than being a separate icon
 * because it is type, not an illustration, and it should track and colour with
 * the word it follows.
 */
export function Action({ variant = 'default', size = 'md', chevrons, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap',
        MICRO,
        'transition-colors duration-100', // Fast and linear. A tool acknowledges; it does not ease.
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        'disabled:pointer-events-none disabled:opacity-40',
        ACTION_VARIANTS[variant],
        ACTION_SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
      {chevrons && <span aria-hidden="true">&gt;&gt;&gt;</span>}
    </button>
  )
}

/* ── Compartments ─────────────────────────────────────────────────────────── */

/**
 * A bordered zone. The admin's only container, and it is a frame rather than a
 * card — no fill of its own, no shadow, no radius.
 */
export function Zone({ className, children, ...props }) {
  return (
    <section className={cn('border', EDGE, CELL, className)} {...props}>
      {children}
    </section>
  )
}

/**
 * A zone's header bar: an ASCII-framed label, a unit id, and actions.
 *
 * The `[ ]` framing is doing real work rather than being decoration — it is what
 * separates a 10px tracked label from the 10px tracked data sitting under it,
 * without spending a second type size on the distinction.
 */
export function ZoneHead({ label, unit, children }) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b bg-news-200 px-3 py-2',
        EDGE,
      )}
    >
      <h2 className={cn(MICRO, 'text-ink-950')}>
        <span aria-hidden="true" className="text-ink-950/40">
          [{' '}
        </span>
        {label}
        <span aria-hidden="true" className="text-ink-950/40">
          {' '}]
        </span>
      </h2>

      <div className="flex items-center gap-3">
        {unit && <span className={cn(MICRO, 'text-ink-950/45')}>{unit}</span>}
        {children}
      </div>
    </header>
  )
}

/** A full-width rule. The hazard variant marks an edge that matters. */
export function Rule({ hazard }) {
  return hazard ? (
    <hr aria-hidden="true" className="hazard h-1 border-0" />
  ) : (
    <hr aria-hidden="true" className={cn('border-t', EDGE)} />
  )
}

/**
 * A registration mark, for a grid intersection or a zone corner.
 *
 * Positioned by the caller. Straddles whatever it is placed on, which is why it
 * is translated rather than inset — a crosshair inside a corner is a decoration,
 * a crosshair on a corner is a register.
 */
export function Crosshair({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute grid size-3 place-items-center text-[11px] leading-none text-ink-950',
        className,
      )}
    >
      +
    </span>
  )
}

/* ── Controls ─────────────────────────────────────────────────────────────── */

// Square, filled with a recessed paper tone rather than white, and the focus
// state is a carbon frame rather than a ring — a glow is the one thing a printed
// control cannot do.
const CONTROL = cn(
  'w-full appearance-none rounded-none border bg-news-100 px-2.5 py-2 text-[14px] text-ink-950',
  'placeholder:text-ink-950/35',
  'focus:border-ink-950 focus:bg-white focus:outline-none',
  'border-ink-950/30',
)

export const CONTROL_CLASS = CONTROL

export function TextInput({ invalid, className, ...props }) {
  return <input className={cn(CONTROL, invalid && 'border-brand-600 bg-brand-50', className)} {...props} />
}

export function TextArea({ invalid, rows = 3, className, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(CONTROL, 'resize-y leading-relaxed', invalid && 'border-brand-600 bg-brand-50', className)}
      {...props}
    />
  )
}

export function Select({ options = [], invalid, className, ...props }) {
  return (
    <select className={cn(CONTROL, MICRO, 'h-9 py-0 pr-7', invalid && 'border-brand-600', className)} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

/**
 * Label, help, control, error.
 *
 * The label is `MICRO`, so it is the same size as a table header and a button —
 * the point of having one metadata register is that a field label and a column
 * header are the same *kind* of thing and should not argue about it.
 *
 * Help sits above the control. Help underneath is read after the field has been
 * filled in, which is too late to be help.
 */
export function Field({ label, help, error, required, htmlFor, children, className }) {
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={htmlFor} className={cn(MICRO, 'flex items-baseline gap-1 text-ink-950')}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-brand-600">
            ®
          </span>
        )}
      </label>

      {help && (
        <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-[1.5] text-ink-950/55">{help}</p>
      )}

      <div className="mt-2">{children}</div>

      {error && (
        <p role="alert" className={cn(MICRO, 'mt-1.5 text-brand-600')}>
          <span aria-hidden="true">/// </span>
          {error}
        </p>
      )}
    </div>
  )
}

/* ── Readouts ─────────────────────────────────────────────────────────────── */

const TAG_TONES = {
  neutral: 'border-ink-950/30 text-ink-950/70',
  live: 'border-ink-950 bg-ink-950 text-news-100',
  draft: 'border-ink-950/30 bg-news-300 text-ink-950/70',
  warn: 'border-brand-600 text-brand-600',
}

/** A status marker. Square, outlined, `MICRO` — never a coloured pill. */
export function Tag({ tone = 'neutral', children }) {
  return (
    <span className={cn(MICRO, 'inline-flex items-center border px-1.5 py-1', TAG_TONES[tone])}>
      {children}
    </span>
  )
}

/**
 * A number set as a measurement: macro scale, with its unit label in micro
 * beneath. This is the bimodal contrast in its smallest form, and the one place
 * the admin is allowed to be loud.
 */
export function Readout({ value, label, href }) {
  return (
    <div className="flex flex-col justify-between gap-6 p-3">
      <span className={cn(MICRO, 'text-ink-950/45')}>{label}</span>
      <data className={cn(MACRO, DATA, 'text-[clamp(3rem,7vw,5rem)] tracking-[-0.05em] text-ink-950')}>
        {value}
      </data>
      {href}
    </div>
  )
}

/**
 * A whole-zone state: loading, empty, or failed.
 *
 * One component for the three because they occupy the same slot and a screen with
 * a designed empty state but an undesigned error state shows a blank box on the
 * day it matters most. Machine-voiced (`<samp>`), because that is what it is.
 */
export function State({ kind = 'empty', title, detail, children }) {
  const marks = { loading: '/// ///', empty: '— — —', error: '!!!' }

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <samp
        aria-hidden="true"
        className={cn(
          MICRO,
          'tracking-[0.3em]',
          kind === 'error' ? 'text-brand-600' : 'text-ink-950/35',
          kind === 'loading' && 'animate-pulse',
        )}
      >
        {marks[kind]}
      </samp>
      <p className={cn(MICRO, kind === 'error' ? 'text-brand-600' : 'text-ink-950')}>{title}</p>
      {detail && <p className="max-w-[46ch] text-[12.5px] leading-[1.5] text-ink-950/55">{detail}</p>}
      {children}
    </div>
  )
}

/**
 * A barcode block. Drawn with a gradient rather than set as type, so it costs no
 * font and carries no content — an industrial marker in the literal sense.
 */
export function Barcode({ className, invert }) {
  const ink = invert ? '#f4f4f0' : '#050505'

  return (
    <span
      aria-hidden="true"
      className={cn('block h-4', className)}
      style={{
        backgroundImage: `repeating-linear-gradient(90deg, ${ink} 0 1px, transparent 1px 3px, ${ink} 3px 5px, transparent 5px 8px, ${ink} 8px 9px, transparent 9px 13px)`,
      }}
    />
  )
}
