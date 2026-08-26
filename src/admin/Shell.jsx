import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { COLLECTIONS, COLLECTION_KEYS } from './data/schema'
import { BACKEND_NAME, IS_LOCAL_BACKEND } from './data'
import { signOut } from './data/session'
import { Confirm, DATA, EDGE, GAUGE, Lamp, LEGEND, TickRail } from './ui'

/**
 * The admin's chrome: the binnacle the panels are mounted in.
 *
 * The rail is a darker moulding than the panels beside it rather than a lighter
 * one — the housing an instrument sits in is behind it, not in front. That is
 * also why it carries no fill on its active state: the channel that is selected
 * is marked by a lit bar on its edge, the way a mode switch on a cluster is,
 * because a filled block inside the housing would be a second panel where there
 * should be none.
 *
 * Everything the rail carries is `LEGEND`, so it reads as a printed switch
 * legend rather than as navigation furniture.
 *
 * The site's own navbar is deliberately absent. This is a separate application
 * that shares a domain, and a marketing header over a spec table is how a back
 * office ends up feeling like a page instead of a tool.
 */
export default function Shell({ onSignOut, children }) {
  const { pathname } = useLocation()

  return (
    <div className="min-h-dvh bg-rig-990 font-body text-lume-100">
      {/* The backlight. A cluster is lit from inside its own housing, so the
          brightest point of the substrate is behind the working area and it
          falls off to the edges. Fixed rather than scrolling: the lamp is in the
          rig, not on the page. Cheap — one radial gradient, no blend mode. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, oklch(24% 0.016 255) 0%, transparent 60%)',
        }}
      />

      <div className="relative flex min-h-dvh flex-col lg:flex-row">
        <Rail onSignOut={onSignOut} />

        {/* The working area is the sheet, and the rail is not. `sheet` re-points
            the palette to its light end for this column only, so every panel
            inside it is a white face on a grey substrate while the housing it is
            mounted in stays the dark moulding it was. Same components, same
            tokens — the switch legend is still lit type on graphite, and what
            you read and write on is paper clipped into it. */}
        <div className="sheet relative flex min-w-0 flex-1 flex-col bg-rig-990">
          {/* Hung off the rail rather than centred in what is left of the
              viewport. A centred measure is right for a document and wrong for a
              console: it opens a gap beside the nav that grows with the screen,
              so the switch legend and the panel it selects drift apart exactly
              when there is most room for them to. Left-aligned, the rail and the
              readout stay one assembly at any width.

              `max-w` still caps the measure, because a 24-column table stretched
              across an ultrawide is not denser, only wider.

              `key` resets scroll and mount state per route — and replays the
              power-on stagger, which is the point of having it. Without it,
              opening a long model page and then a short one also leaves you
              scrolled past the bottom of the new one. */}
          <main
            key={pathname}
            className="w-full max-w-[1240px] flex-1 px-4 py-6 sm:px-8 sm:py-10"
          >
            {children}
          </main>

          <footer className={cn('mt-auto border-t px-4 py-3 sm:px-8', EDGE)}>
            <div className={cn(LEGEND, 'flex flex-wrap items-center gap-x-5 gap-y-2 text-lume-600')}>
              <span>© Revolt Nepal</span>
              <span>MV Dugar Group</span>
              <span className={cn(DATA, 'ml-auto flex items-center gap-2')}>
                <Lamp live={!IS_LOCAL_BACKEND} alarm={IS_LOCAL_BACKEND} />
                Adapter / {BACKEND_NAME.toUpperCase()}
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

function Rail({ onSignOut }) {
  return (
    <aside
      className={cn(
        'knurl relative z-10 shrink-0 border-b bg-rig-990 lg:flex lg:h-dvh lg:w-60 lg:flex-col',
        'lg:sticky lg:top-0 lg:border-b-0 lg:border-r',
        EDGE,
      )}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:py-5">
        <Link to="/admin" className="block">
          <span className={cn(GAUGE, 'block text-[26px] font-extrabold text-lume-100')}>
            Revolt
          </span>
          <span className={cn(LEGEND, 'mt-1.5 block text-lume-600')}>Cluster / D-01</span>
        </Link>

        {/* On a phone the rail is a horizontal strip with no foot to pin to, so
            the sign-out sits up beside the wordmark instead. */}
        <div className="lg:hidden">
          <SignOut onSignOut={onSignOut} />
        </div>
      </div>

      {/* Inset by a padded wrapper rather than by margins on the rail itself:
          the scale is `w-full`, and `w-full` plus `mx-5` is 100% of the housing
          *plus* 40px, so the graduation ran 20px out past the bezel and into the
          worksheet beside it. Invisible while both sides were graphite. */}
      <div className="hidden px-5 lg:block">
        <TickRail className="opacity-60" />
      </div>

      {/* Channels, numbered. The number is not ornament: these are the tool's
          fixed inputs, they never reorder, and a numbered switch legend is how
          you learn a panel by muscle memory rather than by reading it. */}
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-5 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-3">
        <RailLink to="/admin" index={0} end>
          Overview
        </RailLink>
        {COLLECTION_KEYS.map((key, position) => (
          <RailLink key={key} to={`/admin/${key}`} index={position + 1}>
            {COLLECTIONS[key].label}
          </RailLink>
        ))}
      </nav>

      <div className="mt-auto hidden px-5 py-5 lg:block">
        <TickRail className="mb-5 opacity-40" />
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={cn(
            LEGEND,
            'block text-lume-600 transition-colors hover:text-lume-100',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-400',
          )}
        >
          View site ↗
        </a>
        <div className="mt-3.5">
          <SignOut onSignOut={onSignOut} />
        </div>
      </div>
    </aside>
  )
}

function RailLink({ to, index, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          LEGEND,
          'group relative flex items-center gap-3 whitespace-nowrap rounded-[2px] py-2.5 pl-3 pr-3',
          'transition-colors duration-100',
          'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-volt-400',
          isActive ? 'bg-rig-950 text-lume-100' : 'text-lume-600 hover:bg-rig-950/60 hover:text-lume-100',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* The lit edge. A 2px bar on the leading side of the switch, which is
              where a cluster puts the indication for a selected channel — and it
              is the only thing in the housing that is allowed to glow. */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-y-1 left-0 w-0.5 rounded-full transition-colors duration-100',
              isActive ? 'bg-volt-400 lume' : 'bg-transparent',
            )}
          />
          <span className={cn(DATA, isActive ? 'text-volt-400' : 'text-lume-600/70')}>
            {String(index).padStart(2, '0')}
          </span>
          {children}
        </>
      )}
    </NavLink>
  )
}

/**
 * Sign out, asked first.
 *
 * The control sits two lines under the last channel in the rail and one line
 * under "View site", which is a link people click on purpose — so the miss is
 * cheap to make and expensive to pay for: it drops the session and returns the
 * whole tool to the login screen, and anything typed into an open editor and not
 * committed goes with it.
 *
 * The question is the tool's own panel rather than the browser's dialog — see
 * [[Confirm]]. `window.confirm` was doing this job for an afternoon and reads as
 * what it is: a box captioned with the hostname, in the browser's type, over an
 * interface built to look like an instrument.
 */
function SignOut({ onSignOut }) {
  const [asking, setAsking] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setAsking(true)}
        className={cn(
          LEGEND,
          'text-lume-600 transition-colors hover:text-brand-400',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt-400',
        )}
      >
        Sign out
      </button>

      <Confirm
        open={asking}
        title="Sign out"
        detail="You will be returned to the login screen. Anything typed into an open editor and not saved is lost; everything already committed stays where it is."
        confirmLabel="Sign out"
        onCancel={() => setAsking(false)}
        onConfirm={() => {
          setAsking(false)
          signOut()
          onSignOut()
        }}
      />
    </>
  )
}

/**
 * A screen's heading block: the one gauge-scale element on any page.
 *
 * The eyebrow and the count are `LEGEND` against a title set at up to 3.4rem,
 * and that gap is the page's entire hierarchy. The tick rail underneath closes
 * the block — it is the graduation the title is standing on, and it is what
 * makes the head read as the top of an instrument rather than as an `h1` with a
 * border-bottom.
 */
export function PageHead({ eyebrow, title, count, children }) {
  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="animate-power-on min-w-0">
          {eyebrow && <div className={cn(LEGEND, 'mb-3 text-lume-600')}>{eyebrow}</div>}
          <h1 className={cn(GAUGE, 'flex items-baseline gap-4 text-[clamp(2rem,5vw,3.4rem)]')}>
            <span className="min-w-0 break-words">{title}</span>
            {count != null && (
              <data className={cn(DATA, 'text-[0.38em] font-normal tracking-normal text-volt-700')}>
                {String(count).padStart(3, '0')}
              </data>
            )}
          </h1>
        </div>

        {children && (
          <div
            className="animate-power-on flex flex-wrap items-center gap-2"
            style={{ animationDelay: '80ms' }}
          >
            {children}
          </div>
        )}
      </div>

      <TickRail sweep delay={140} className="mt-5" />
    </header>
  )
}
