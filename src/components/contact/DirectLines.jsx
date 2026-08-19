import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CONTACT } from '@/constants/site'
import { DEALERS } from '@/data/dealers'
import { ArrowUpRight } from '@/components/ui/icons'
import { cn } from '@/utils/cn'

/**
 * The three direct lines, as an index rather than a card row.
 *
 * The draft this replaces was three equal cells with an icon disc in each — the
 * single most templated arrangement there is, and one that spent its width on
 * three grey circles and its contrast on a 10px label. An address book does not
 * need pictograms; a phone number is legible because it is a phone number.
 *
 * So: ruled rows, numbered, with the value set at display size and given the
 * whole line. The number is the only ornament, it earns its place by making
 * three unlike things (a number, an address, a list of cities) read as one
 * ordered set, and the rules do the work the discs were doing.
 *
 * PLACEHOLDER DATA — phone, email and the showroom cities come from
 * `constants/site.js` and `data/dealers.js`, and are still stubs.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

/**
 * Two surfaces, one index. The rows were written white-on-black for a dark
 * masthead that no longer exists; the page they now sit on is paper, and the
 * closing black belongs to the footer. Rather than fork the component, the
 * palette is lifted out — everything else about the row is identical, because
 * the arrangement was never the thing that depended on the background.
 */
const TONES = {
  dark: {
    rule: 'border-white/12',
    index: 'text-white/25',
    label: 'text-white/45',
    value: 'text-white',
    arrow: 'text-white/25',
    arrowHover: 'group-hover:text-white',
  },
  light: {
    rule: 'border-ink-900/12',
    index: 'text-ink-900/25',
    label: 'text-ink-500',
    value: 'text-ink-900',
    arrow: 'text-ink-900/25',
    arrowHover: 'group-hover:text-ink-900',
  },
}

// CONTACT.hours in numbers, so the badge and the printed line cannot disagree.
// Change one, change the other.
const OPEN_HOUR = 10
const CLOSE_HOUR = 18
const CLOSED_DAY = 6 // Saturday
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Weekday and hour at the desk. Returns null where the runtime has no timezone
 * data — the badge then sits out rather than asserting an hour it cannot know,
 * and the printed hours carry the answer on their own.
 */
function deskClock() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      weekday: 'short',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date())

    const day = SHORT_DAYS.indexOf(parts.find((part) => part.type === 'weekday')?.value)
    const hour = Number(parts.find((part) => part.type === 'hour')?.value) % 24

    if (day < 0 || Number.isNaN(hour)) return null
    return { day, hour }
  } catch {
    return null
  }
}

function readDesk() {
  const now = deskClock()
  if (!now) return null

  const working = now.day !== CLOSED_DAY

  if (working && now.hour >= OPEN_HOUR && now.hour < CLOSE_HOUR) {
    return { open: true, label: `Open now — until ${CLOSE_HOUR}:00` }
  }

  // Before opening on a working day the wait is hours, not a day, and saying so
  // is the difference between a visitor waiting and a visitor leaving.
  if (working && now.hour < OPEN_HOUR) {
    return { open: false, label: `Closed — opens ${OPEN_HOUR}:00 today` }
  }

  let next = (now.day + 1) % 7
  while (next === CLOSED_DAY) next = (next + 1) % 7

  return { open: false, label: `Closed — opens ${WEEKDAYS[next]}, ${OPEN_HOUR}:00` }
}

/** Reads the desk on mount, then once a minute. Shared by the badge below. */
function useDesk() {
  // State only moves when the sentence changes — enough to keep the badge honest
  // on a page left open across 18:00, cheap enough to never show up in a frame.
  const [desk, setDesk] = useState(readDesk)

  useEffect(() => {
    const id = setInterval(() => {
      setDesk((current) => {
        const next = readDesk()
        if (next?.label === current?.label && next?.open === current?.open) return current
        return next
      })
    }, 60_000)

    return () => clearInterval(id)
  }, [])

  return desk
}

/**
 * Whether anyone is at the desk right now, in Kathmandu time rather than the
 * reader's — what a visitor wants to know is whether a call gets picked up, not
 * what their own clock says.
 *
 * Set as a plain line rather than a pill: it goes in a ruled cell beside the
 * other two facts about the desk, and a pill in one cell of three would make
 * that one look like a control. The dot inherits its colour from the text, so
 * the same line works on either surface; only "open" spends a colour, and it
 * spends volt rather than red, because red on this site marks position.
 *
 * Returns null where the runtime cannot resolve Kathmandu time — the printed
 * hours in the next cell carry the answer on their own.
 */
export function DeskStatus({ className }) {
  const desk = useDesk()
  if (!desk) return null

  return (
    <span className={cn('inline-flex items-baseline gap-2.5', className)}>
      {/* Baseline-aligned by a wrapper of the line's own height, so the dot sits
          on the type's optical centre instead of on its baseline. */}
      <span aria-hidden="true" className="relative flex h-[1lh] w-1.5 items-center">
        {desk.open && (
          <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-volt-500 opacity-60" />
        )}
        <span
          className={cn(
            'relative inline-flex size-1.5 rounded-full',
            desk.open ? 'bg-volt-500' : 'bg-current opacity-30',
          )}
        />
      </span>
      {desk.label}
    </span>
  )
}

const LINES = [
  {
    id: 'call',
    label: 'Call',
    value: CONTACT.phone,
    href: `tel:${CONTACT.phone}`,
  },
  {
    id: 'email',
    label: 'Email',
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
  },
  {
    id: 'visit',
    label: 'Showrooms',
    // The cities rather than the head office address: a visitor scanning for
    // "is there one near me" is looking for a place name, not a street.
    value: DEALERS.map((dealer) => dealer.city).join(' · '),
    to: '/dealers',
  },
]

export default function DirectLines({ tone = 'dark', className }) {
  const palette = TONES[tone]

  return (
    <ul className={cn('border-t', palette.rule, className)}>
      {LINES.map(({ id, label, value, href, to }, i) => {
        const inner = (
          <>
            {/* The index. Tabular so 01/02/03 hold a common width, and the only
                thing on the row that moves to brand red — a rule of the site is
                that red marks position, not decoration. */}
            <span
              className={cn(
                'font-display text-[11px] font-bold tabular-nums',
                palette.index,
                'transition-colors duration-500',
                EASE,
                'group-hover:text-brand-500',
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            <span
              className={cn(
                'text-[10px] font-semibold tracking-[0.24em] uppercase',
                palette.label,
              )}
            >
              {label}
            </span>

            {/* The value carries the row. Set at display size because it is the
                thing being offered, and truncated rather than wrapped so three
                rows of unequal content stay on one rhythm. */}
            <span
              className={cn(
                'min-w-0 truncate font-display text-[clamp(1.15rem,2.2vw,1.6rem)] font-bold tracking-[-0.02em]',
                palette.value,
                'transition-transform duration-500',
                EASE,
                'sm:group-hover:translate-x-1',
              )}
            >
              {value}
            </span>

            <ArrowUpRight
              className={cn(
                'size-4 shrink-0',
                palette.arrow,
                'transition-[transform,color] duration-500',
                EASE,
                'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
                palette.arrowHover,
              )}
            />
          </>
        )

        const rowClass = cn(
          'group relative grid items-center outline-none',
          // Mobile keeps the label stacked over the value; from sm the row opens
          // into four columns and the index gains a gutter of its own.
          'grid-cols-[1.75rem_1fr_auto] gap-x-4 gap-y-1 py-5',
          'sm:grid-cols-[3rem_8rem_1fr_auto] sm:gap-x-6 sm:py-7',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
          // The label sits under the index on mobile, beside it from sm.
          '[&>span:nth-child(2)]:col-start-2 [&>span:nth-child(2)]:row-start-1',
          '[&>span:nth-child(3)]:col-start-2 [&>span:nth-child(3)]:row-start-2',
          'sm:[&>span:nth-child(3)]:col-start-3 sm:[&>span:nth-child(3)]:row-start-1',
          '[&>svg]:col-start-3 [&>svg]:row-span-2 [&>svg]:row-start-1',
          'sm:[&>svg]:col-start-4 sm:[&>svg]:row-span-1',
        )

        return (
          <li key={id} className={cn('border-b', palette.rule)}>
            {to ? (
              <Link to={to} className={rowClass}>
                {inner}
                <Rule />
              </Link>
            ) : (
              <a href={href} className={rowClass}>
                {inner}
                <Rule />
              </a>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * The hover rule: a red hairline that wipes across the bottom of the row from
 * the left. Transform-only, so the whole set stays on the compositor.
 */
function Rule() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 -bottom-px col-span-full h-px origin-left scale-x-0 bg-brand-500',
        'transition-transform duration-700',
        EASE,
        'group-hover:scale-x-100',
      )}
    />
  )
}
