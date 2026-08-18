import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-500',
  secondary: 'bg-ink-900 text-white hover:bg-ink-800',
  outline: 'border border-ink-900/15 text-ink-900 hover:border-ink-900/40 hover:bg-ink-50',
  ghost: 'text-ink-900 hover:bg-ink-50',
  // For dark/OLED surfaces: hairline glass instead of a solid fill.
  glass: 'border border-white/15 bg-white/[0.07] text-white hover:bg-white/15 hover:border-white/30',
}

const SIZES = {
  sm: 'gap-2 pl-4 pr-4 py-2 text-sm',
  md: 'gap-2.5 pl-5 pr-5 py-2.5 text-sm',
  lg: 'gap-3 pl-7 pr-7 py-3.5 text-base',
}

// With a trailing icon the right padding tightens so the nested circle
// sits flush inside the pill rather than floating in dead space.
const ICON_SIZES = {
  sm: { pad: 'pr-1.5', dot: 'size-6 text-[11px]' },
  md: { pad: 'pr-2', dot: 'size-8 text-xs' },
  lg: { pad: 'pr-2.5', dot: 'size-10 text-sm' },
}

const ICON_TONES = {
  primary: 'bg-white/20 text-white',
  secondary: 'bg-white/15 text-white',
  outline: 'bg-ink-900/5 text-ink-900',
  ghost: 'bg-ink-900/5 text-ink-900',
  glass: 'bg-white/10 text-white',
}

// How the trailing glyph answers a hover.
//
// `nudge` is the default across the site: the whole circle steps out and up, the
// kinetic tension the pill was drawn with.
//
// `lift` leaves the circle where it is and moves the arrow inside it — the glyph
// rides up and out of the top while a second copy comes in from the bottom to
// take its place. Two copies, not one that returns: an arrow that only slides up
// leaves an empty circle for the length of the hover. The circle needs
// `overflow-hidden` for the exit to read as leaving rather than as floating over
// the label.
const ICON_MOTION = {
  nudge: 'group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105',
  lift: '',
}

const GLYPH_SWAP = 'transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]'

/**
 * Renders a <Link> when `to` is given, an <a> when `href` is given,
 * otherwise a <button>. Keeps every call site visually consistent.
 *
 * `trailingIcon` nests the glyph in its own circle and gives it kinetic
 * tension on hover — the icon never sits naked beside the label.
 */
export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  trailingIcon,
  iconMotion = 'nudge',
  className,
  children,
  ...props
}) {
  const icon = ICON_SIZES[size]

  const classes = cn(
    'group relative inline-flex items-center justify-center rounded-full font-semibold',
    // Only cheap, compositable properties — never `transition-all`.
    'transition-[background-color,border-color,color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    trailingIcon && icon.pad,
    className,
  )

  const content = (
    <>
      {children}
      {trailingIcon && (
        <span
          aria-hidden="true"
          className={cn(
            'relative flex shrink-0 items-center justify-center rounded-full',
            'transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
            ICON_MOTION[iconMotion],
            iconMotion === 'lift' && 'overflow-hidden',
            icon.dot,
            ICON_TONES[variant],
          )}
        >
          {iconMotion === 'lift' ? (
            <>
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  GLYPH_SWAP,
                  'group-hover:-translate-y-full group-focus-visible:-translate-y-full',
                )}
              >
                {trailingIcon}
              </span>
              <span
                className={cn(
                  'absolute inset-0 flex translate-y-full items-center justify-center',
                  GLYPH_SWAP,
                  'group-hover:translate-y-0 group-focus-visible:translate-y-0',
                )}
              >
                {trailingIcon}
              </span>
            </>
          ) : (
            trailingIcon
          )}
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  )
}
