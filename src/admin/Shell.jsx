import { Link, NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { COLLECTIONS, COLLECTION_KEYS } from './backend/schema'
import { BACKEND_NAME, IS_LOCAL_BACKEND } from './backend'
import { signOut } from './backend/session'
import { Barcode, Crosshair, EDGE, MACRO, MICRO, Rule, Tag } from './ui'

/**
 * The admin's chrome: a carbon rail against the paper sheet.
 *
 * The rail is the one dark mass in the interface and it is the exception that
 * proves the substrate — a sheet of paper with a black bar printed down its edge,
 * not a dark theme with a light panel. Everything the rail carries is `MICRO`, so
 * it reads as a printed index rather than as navigation furniture.
 *
 * The site's own navbar is deliberately absent. This is a separate application
 * that shares a domain, and a marketing header over a spec table is how a back
 * office ends up feeling like a page instead of a tool.
 */
export default function Shell({ onSignOut, children }) {
  const { pathname } = useLocation()

  return (
    <div className="halftone min-h-dvh bg-news-100 font-body text-ink-950">
      {/* Grain over the sheet. The halftone gives it dot texture; this gives it
          tooth. Both are near-invisible alone and neither is optional: a screen
          built entirely from flat fills and 1px rules is vector-perfect in a way
          no printed thing has ever been. `multiply` because the substrate is
          light — an overlay blend on paper lifts it instead of dirtying it. */}
      <div
        aria-hidden="true"
        className="grain pointer-events-none fixed inset-0 opacity-[0.35] mix-blend-multiply"
      />

      <div className="relative flex min-h-dvh flex-col lg:flex-row">
        <Rail onSignOut={onSignOut} />

        <div className="flex min-w-0 flex-1 flex-col">
          {IS_LOCAL_BACKEND && <LocalNotice />}

          {/* `key` resets scroll and mount state per route: without it, opening a
              long model page and then a short one leaves you scrolled past the
              bottom of the new one. */}
          <main key={pathname} className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-8 sm:py-10">
            {children}
          </main>

          <footer className={cn('mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-3 sm:px-8', EDGE)}>
            <span className={cn(MICRO, 'text-ink-950/45')}>© Revolt Nepal</span>
            <span className={cn(MICRO, 'text-ink-950/45')}>MV Dugar Group</span>
            <span className={cn(MICRO, 'ml-auto text-ink-950/45')}>
              Adapter / {BACKEND_NAME.toUpperCase()}
            </span>
          </footer>
        </div>
      </div>
    </div>
  )
}

function Rail({ onSignOut }) {
  return (
    <aside className={cn('relative shrink-0 border-b bg-ink-950 text-news-100 lg:w-56 lg:border-b-0 lg:border-r', EDGE)}>
      <Crosshair className="right-0 top-0 translate-x-1/2 -translate-y-1/2 text-news-100 lg:text-ink-950" />

      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:block">
        <Link to="/admin" className="block">
          <span className={cn(MACRO, 'block text-[22px] text-news-100')}>Revolt</span>
          <span className={cn(MICRO, 'mt-1 block text-news-100/50')}>Back office / D-01</span>
        </Link>

        {/* On a phone the rail is a horizontal strip with no bottom to pin to, so
            the sign-out sits up beside the wordmark instead. */}
        <div className="lg:hidden">
          <SignOut onSignOut={onSignOut} />
        </div>
      </div>

      <Barcode invert className="mx-4 hidden opacity-70 lg:block" />

      <nav className="flex gap-px overflow-x-auto px-4 pb-3 lg:mt-5 lg:flex-col lg:overflow-visible">
        <RailLink to="/admin" end>
          Overview
        </RailLink>
        {COLLECTION_KEYS.map((key) => (
          <RailLink key={key} to={`/admin/${key}`}>
            {COLLECTIONS[key].label}
          </RailLink>
        ))}
      </nav>

      <div className="mt-auto hidden px-4 py-4 lg:block">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={cn(MICRO, 'block text-news-100/50 transition-colors hover:text-news-100')}
        >
          View site ↗
        </a>
        <div className="mt-3">
          <SignOut onSignOut={onSignOut} />
        </div>
      </div>
    </aside>
  )
}

function RailLink({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          MICRO,
          'flex items-center gap-2 whitespace-nowrap py-2.5 transition-colors lg:px-0',
          isActive ? 'text-news-100' : 'text-news-100/45 hover:text-news-100',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* The active mark is a printed pointer, not a highlight. A filled block
              on the rail would be a second dark mass inside the only dark mass. */}
          <span aria-hidden="true" className={isActive ? 'text-brand-600' : 'text-transparent'}>
            &gt;
          </span>
          {children}
        </>
      )}
    </NavLink>
  )
}

function SignOut({ onSignOut }) {
  return (
    <button
      type="button"
      onClick={() => {
        signOut()
        onSignOut()
      }}
      className={cn(MICRO, 'text-news-100/50 transition-colors hover:text-brand-600')}
    >
      Sign out
    </button>
  )
}

/**
 * The honest notice, and the one place the hazard rule is used.
 *
 * Not dismissible for as long as the local adapter is what answers. Somebody
 * spending an afternoon writing three model pages needs to know before they start
 * that the work is in this browser and not on the site — a notice they closed on
 * Tuesday cannot tell them that on Thursday.
 */
function LocalNotice() {
  return (
    <div>
      <Rule hazard />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-news-200 px-4 py-2.5 sm:px-8">
        <Tag tone="warn">Local data</Tag>
        <p className="text-[12.5px] leading-snug text-ink-950/75">
          Edits save to this browser only. They do not reach the live site, and another device will not see them.
        </p>
        <span className={cn(MICRO, 'text-ink-950/40')}>
          src/admin/backend/index.js
        </span>
      </div>
      <Rule />
    </div>
  )
}

/**
 * A screen's heading block: the one macro element on any page.
 *
 * The eyebrow and the count are `MICRO` against a title set at up to 4rem, and
 * that gap is the page's entire hierarchy. Nothing between the two registers.
 */
export function PageHead({ eyebrow, title, count, children }) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {eyebrow && <div className={cn(MICRO, 'mb-2.5 text-ink-950/45')}>{eyebrow}</div>}
          <h1 className={cn(MACRO, 'flex items-baseline gap-4 text-[clamp(1.9rem,5vw,3.4rem)]')}>
            <span className="min-w-0 break-words">{title}</span>
            {count != null && (
              <data className={cn('font-mono text-[0.4em] tabular-nums tracking-normal text-brand-600')}>
                {String(count).padStart(3, '0')}
              </data>
            )}
          </h1>
        </div>

        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>

      <div className="mt-4">
        <Rule />
      </div>
    </header>
  )
}
