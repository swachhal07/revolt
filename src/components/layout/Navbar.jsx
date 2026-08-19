import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import LineupMenu from '@/components/layout/LineupMenu'
import { ChevronDown } from '@/components/ui/icons'
import { NAV_LINKS, SITE } from '@/constants/site'
import { MOTORCYCLES } from '@/data/motorcycles'
import dugarLogo from '@/assets/images/dugar-logo.png'
import revoltLogo from '@/assets/images/new-logo-1.png'

// The header carries the short path only: home, the lineup, the writing, the
// company. Dealers and Contact are still routes and are still listed in the
// footer — they are just not top-level bar items, and Contact already has the
// button on the right. Labels and order both come from NAV_LINKS, so the bar and
// the footer cannot drift and Blog lands where the footer already puts it.
const HEADER_PATHS = ['/', '/motorcycles', '/blog', '/about']

const navItems = NAV_LINKS.filter((link) => HEADER_PATHS.includes(link.to)).map((link) => ({
  label: link.label,
  path: link.to,
}))

// The one bar item that opens a panel instead of navigating. Matched on the
// path rather than the label so renaming "Motorcycles" in NAV_LINKS cannot
// silently detach the menu from its trigger.
const MENU_PATH = '/motorcycles'
const MENU_ID = 'lineup-menu'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)
  // The mega menu. Separate from `hovered`: the bar goes solid on any pointer
  // crossing it, which is not the same event as the lineup being asked for.
  const [menu, setMenu] = useState(false)
  // Which top-level item the mobile sheet has expanded, if any.
  const [sheetSection, setSheetSection] = useState(null)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const closeMenu = useCallback(() => setMenu(false), [])
  const keepMenu = useCallback(() => setMenu(true), [])

  // Fixed navbar: transparent over the home hero, solid once scrolled.
  // It never hides — the bar stays pinned for the whole page.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Any navigation closes the mobile sheet and the mega menu — otherwise either
  // one hangs over the new page. Picking a bike out of the panel is the most
  // ordinary way this happens.
  useEffect(() => {
    setOpen(false)
    setSheetSection(null)
    setMenu(false)
  }, [pathname])

  // "Solid" = white background with dark text. Always solid off the home
  // page; on home it turns solid as soon as the user scrolls or hovers the bar.
  // An open panel counts: it is grey-on-white, and a transparent bar over the
  // hero film would leave it hanging off nothing.
  const solid = !isHome || scrolled || hovered || menu

  return (
    <header
      onMouseEnter={() => setHovered(true)}
      // The panel lives inside the header, directly under the bar, so the
      // pointer never leaves this element on its way from the trigger down into
      // the grid. That is what lets the menu close on a plain mouse-leave with
      // no hover-intent timer anywhere in the component.
      onMouseLeave={() => {
        setHovered(false)
        setMenu(false)
      }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? 'border-b border-ink-900/10 bg-white shadow-[0_10px_30px_-12px_rgba(18,18,20,0.25)]'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="relative mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-5 lg:px-10">
        {/* Logos side by side, separated by a divider.
            The three regions each take an equal flex-1 share, so the centre nav
            stays visually centred while its bounds never collide with the logo
            or the action buttons at any viewport width. */}
        <Link to="/" aria-label={`${SITE.name} — home`} className="flex flex-1 items-center gap-4">
          <img
            src={dugarLogo}
            alt="MV Dugar Group"
            className="h-12 w-auto object-contain sm:h-14"
          />
          <span
            className={`h-9 w-px transition-colors sm:h-11 ${solid ? 'bg-ink-900/20' : 'bg-white/40'}`}
          />
          {/* The mark is black artwork on transparency. Over the hero film it
              would disappear, so brightness-0 + invert flattens it to pure
              white; on the solid bar it renders as drawn. */}
          <img
            src={revoltLogo}
            alt={SITE.name}
            className={`h-12 w-auto object-contain transition-[filter] duration-300 sm:h-14 ${
              solid ? '' : 'brightness-0 invert'
            }`}
          />
        </Link>

        {/* Center nav */}
        <ul className="hidden flex-1 items-center justify-center gap-8 lg:flex xl:gap-10">
          {navItems.map((item) => {
            const className = `flex items-center gap-1.5 text-[17px] font-medium transition-colors ${
              solid ? 'text-ink-800 hover:text-brand-600' : 'text-white/90 hover:text-white'
            }`

            // The lineup item is a button, not a link. It used to go to the
            // index page and now opens the panel instead, and a control that
            // navigates on click while also opening a menu on hover gives a
            // reader two different outcomes for what looks like one gesture.
            // The index page has not gone anywhere — the panel closes on "All
            // motorcycles".
            if (item.path === MENU_PATH) {
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={menu}
                    aria-controls={MENU_ID}
                    onMouseEnter={keepMenu}
                    onFocus={keepMenu}
                    onClick={() => setMenu((v) => !v)}
                    className={className}
                  >
                    {item.label}
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${
                        menu ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </li>
              )
            }

            return (
              <li key={item.label}>
                {/* Crossing any other item closes the panel. Without this the
                    menu stays open while the pointer sits on About, because the
                    header's own mouse-leave never fires. */}
                <Link to={item.path} className={className} onMouseEnter={closeMenu}>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Right actions */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <Link
            to="/contact"
            className="hidden rounded-full bg-brand-500 px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 sm:inline-block"
          >
            Contact Us
          </Link>
          <Link
            to="/emi-calculator"
            className={`hidden rounded-full border px-5 py-3 text-[15px] font-semibold transition-colors sm:inline-block ${
              solid
                ? 'border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white'
                : 'border-white/50 text-white hover:bg-white/10'
            }`}
          >
            EMI Calculator
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`block h-0.5 w-6 transition-colors ${i > 0 ? 'mt-1.5' : ''} ${
                  solid ? 'bg-ink-800' : 'bg-white'
                }`}
              />
            ))}
          </button>
        </div>
      </nav>

      <LineupMenu id={MENU_ID} open={menu} onClose={closeMenu} onKeepOpen={keepMenu} />

      {/* Mobile menu */}
      {open && (
        <ul className="mx-6 mb-4 flex flex-col gap-1 rounded-xl bg-white p-3 shadow-lg lg:hidden">
          {navItems.map((item) => {
            // The lineup gets a disclosure rather than the panel, which is a
            // desktop object: six cutouts in a phone-width sheet would be six
            // stacked photographs and a great deal of scrolling. Names only.
            if (item.path === MENU_PATH) {
              const expanded = sheetSection === item.path

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setSheetSection(expanded ? null : item.path)}
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-medium text-ink-800 hover:bg-ink-50"
                  >
                    {item.label}
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${
                        expanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expanded && (
                    <ul className="mt-1 mb-1 ml-3 flex flex-col border-l border-ink-900/10 pl-3">
                      {MOTORCYCLES.map((bike) => (
                        <li key={bike.slug}>
                          <Link
                            to={`/motorcycles/${bike.slug}`}
                            className="flex items-baseline justify-between gap-3 rounded px-3 py-2 text-sm text-ink-800 hover:bg-ink-50"
                          >
                            {bike.name}
                            <span className="text-[10px] font-semibold tracking-[0.18em] text-ink-500 uppercase">
                              {bike.class}
                            </span>
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          to="/contact?enquiry=test-ride"
                          className="block rounded px-3 py-2 text-[11px] font-semibold tracking-[0.16em] text-ink-500 uppercase hover:bg-ink-50"
                        >
                          Book a test ride
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )
            }

            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="block w-full rounded px-3 py-2 text-left text-sm font-medium text-ink-800 hover:bg-ink-50"
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
          <li>
            <Link
              to="/emi-calculator"
              className="mt-1 block rounded border border-brand-500 px-3 py-2 text-center text-sm font-semibold text-brand-600"
            >
              EMI Calculator
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="mt-1 block rounded bg-brand-500 px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Contact Us
            </Link>
          </li>
        </ul>
      )}
    </header>
  )
}
