import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_LINKS, SITE } from '@/constants/site'
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

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  // Fixed navbar: transparent over the home hero, solid once scrolled.
  // It never hides — the bar stays pinned for the whole page.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Any navigation closes the mobile sheet — otherwise it hangs over the new page.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // "Solid" = white background with dark text. Always solid off the home
  // page; on home it turns solid as soon as the user scrolls or hovers the bar.
  const solid = !isHome || scrolled || hovered

  return (
    <header
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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

            return (
              <li key={item.label}>
                <Link to={item.path} className={className}>
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

      {/* Mobile menu */}
      {open && (
        <ul className="mx-6 mb-4 flex flex-col gap-1 rounded-xl bg-white p-3 shadow-lg lg:hidden">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className="block w-full rounded px-3 py-2 text-left text-sm font-medium text-ink-800 hover:bg-ink-50"
              >
                {item.label}
              </Link>
            </li>
          ))}
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
