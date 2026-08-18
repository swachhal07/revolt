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
 * what their own clock says. Sits with the page label, because it is a fact
 * about the page and not a fourth way to make contact.
 */
export function DeskBadge({ className }) {
  const desk = useDesk()
  if (!desk) return null

  return (
    <p
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full bg-white/[0.06] py-1.5 pr-4 pl-3',
        'text-[13px] font-semibold text-white/80 ring-1 ring-white/15 ring-inset',
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {desk.open && (
          <span
            aria-hidden="true"
            className="absolute inline-flex size-full animate-ping rounded-full bg-volt-400 opacity-60"
          />
        )}
        <span
          aria-hidden="true"
          className={cn(
            'relative inline-flex size-1.5 rounded-full',
            desk.open ? 'bg-volt-400' : 'bg-white/30',
          )}
        />
      </span>
      {desk.label}
      <span className="font-normal text-white/45">· {CONTACT.hours}</span>
    </p>
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

export default function DirectLines({ className }) {
  return (
    <ul className={cn('border-t border-white/12', className)}>
      {LINES.map(({ id, label, value, href, to }, i) => {
        const inner = (
          <>
            {/* The index. Tabular so 01/02/03 hold a common width, and the only
                thing on the row that moves to brand red — a rule of the site is
                that red marks position, not decoration. */}
            <span
              className={cn(
                'font-display text-[11px] font-bold tabular-nums text-white/25',
                'transition-colors duration-500',
                EASE,
                'group-hover:text-brand-500',
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            <span className="text-[10px] font-semibold tracking-[0.24em] text-white/45 uppercase">
              {label}
            </span>

            {/* The value carries the row. Set at display size because it is the
                thing being offered, and truncated rather than wrapped so three
                rows of unequal content stay on one rhythm. */}
            <span
              className={cn(
                'min-w-0 truncate font-display text-[clamp(1.15rem,2.2vw,1.6rem)] font-bold tracking-[-0.02em] text-white',
                'transition-transform duration-500',
                EASE,
                'sm:group-hover:translate-x-1',
              )}
            >
              {value}
            </span>

            <ArrowUpRight
              className={cn(
                'size-4 shrink-0 text-white/25',
                'transition-[transform,color] duration-500',
                EASE,
                'group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white',
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
          <li key={id} className="border-b border-white/12">
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
