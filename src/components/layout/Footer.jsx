import { Link } from 'react-router-dom'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { CONTACT, NAV_LINKS, SITE } from '@/constants/site'
import FlickeringGrid from '@/components/ui/FlickeringGrid'
import { cn } from '@/utils/cn'
import revoltLogo from '@/assets/images/new-logo-1.png'
import dugarLogo from '@/assets/images/dugar-logo.png'

/**
 * A plate, an index, and the name.
 *
 * The footer this replaces did four jobs — a photographic closing frame with a
 * test-ride ask, a contact desk, a showroom list, a legal plate — and by the
 * time a visitor reaches it every one of those has already been made higher up
 * the page. A second CTA under the first one is not persuasion, it is doubt,
 * and a footer that restates the site is a footer people scroll past.
 *
 * So it is cut to the two things a footer is actually for: how to reach the
 * company, and where else to go. Three answers on one line — address, phone,
 * email — then the whole site as a numbered index, then the name.
 *
 * The structure is ruled rather than boxed. One horizontal rule under the
 * contact line, one under the index, hairline verticals between the cells; no
 * cards, no panels, no rounded trays. The numbers are the only ornament, and
 * they earn their place by making five destinations scan as a list at a glance
 * instead of five words floating in a row.
 *
 * Colour is spent nowhere — not even the faint red wash the other dark
 * sections carry. Everything is white at four opacities on a flat #050505:
 * values at 90%, labels at 40%, small print at 45% (4.3:1 and up). The red
 * belongs to the sections above, where the asks are.
 *
 * The last band is the marque, drawn as a field of flickering dots that
 * dissolves into the black above it: the only ambient motion on the site, and
 * it stops the moment it leaves the viewport.
 *
 * PARTLY PLACEHOLDER DATA — the phone, email, address and social hrefs all come
 * from `constants/site.js`. The phone is real; the email and the social hrefs
 * are still stubs (bare `facebook.com/`). Fixing them there fixes them
 * everywhere.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

// Kept here rather than in constants/site.js: these are the footer's own small
// print, not site navigation, and nothing else on the site links to them.
const LEGAL_LINKS = [
  { label: 'Terms and Conditions', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
]

// Kept here for the same reason as the legal links above: this is the footer's
// own credit, not site navigation, and nothing else links to it.
const DEVELOPER = {
  name: 'Swachhal Lamsal',
  href: 'https://swachhalportfolio.vercel.app/',
}

// The tracked-out micro-label. Used for exactly three words in this file — it
// is a field name above a value, not a decorative heading, which is the only
// job that spacing this wide can do without becoming costume.
const LABEL = 'text-xs font-semibold uppercase tracking-[0.2em] text-white/40'

const VALUE = cn(
  'block font-display text-xl leading-snug text-white/90 lg:text-[1.375rem]',
  'transition-colors duration-300',
  EASE,
  'hover:text-white',
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
)

export default function Footer() {
  const year = new Date().getFullYear()
  // Three bands — ownership, index, small print — one behind the next. The
  // trigger fires early (`top 95%`) because the footer is the last thing on
  // every page: at 85% a reader who scrolls to the very bottom in one throw
  // arrives before the entrance has started. See [[useScrollReveal]].
  const ref = useScrollReveal({ start: 'top 95%', y: 16, duration: 0.7, stagger: 0.08 })

  // The closing marque is set in dots, so it is a picture of a word rather than
  // a word: the long lockup needs the width to stay legible at this grain, and
  // below it the name alone reads better than a squeezed two-worder.
  const wide = useMediaQuery('(min-width: 64rem)')

  return (
    <footer ref={ref} className="relative isolate overflow-hidden bg-ink-950 text-white">
      {/* ── The field ────────────────────────────────────────────────────────
          One canvas behind the whole footer rather than a band at the bottom:
          the dust is the surface the plate is printed on, and the marque is the
          same dust holding still long enough to spell the name. Two canvases
          would mean two animation loops for one effect, so the word is masked
          into this one, measured up from the bottom edge.

          Decorative only — the name is already real text in the plate above, so
          the canvas is hidden from assistive tech rather than read out twice. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <FlickeringGrid
          text={wide ? 'REVOLT NEPAL' : 'REVOLT'}
          // Larger than the fit will allow at either breakpoint, on purpose: the word
          // is sized by `fitWidth` below, and `fontSize` is only the ceiling it would
          // take if the band were ever wide enough not to clamp. Raising it alone does
          // nothing once the fit is binding, which is why it moved together with the
          // fit and not instead of it.
          fontSize={wide ? 240 : 118}
          fontWeight={800}
          textFromBottom={wide ? 150 : 78}
          squareSize={2}
          gridGap={wide ? 3 : 2}
          color="#d4d4d8"
          maxOpacity={0.2}
          flickerChance={0.1}
          // Out to 98% of the band from 92. The marque is the last thing on the site
          // and it is bled to the edges deliberately — the 8% margin read as a word
          // centred in a box rather than a name the page runs out of. It stays under
          // 100 so the R and the L keep a cell of air outside them and the field's own
          // dust is what reaches the edge, not the letterforms.
          fitWidth={0.98}
          // A little heavier against that dust: the floor inside the letters from 0.42
          // to 0.52, the flicker on top of it from 2.6x to 2.9x. The field itself is
          // untouched at maxOpacity 0.2, since what makes the word read bold is the
          // gap between the two — lifting both would only pale the whole band.
          textFloor={0.52}
          textGain={2.9}
        />
      </div>

      {/* Weights the black over the plate so the dust reads as texture under
          the type rather than noise across it, and lifts off entirely by the
          time it reaches the marque. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(5,5,5,0.86),rgba(5,5,5,0.78)_38%,rgba(5,5,5,0.4)_66%,transparent_84%)]"
      />

      {/* Wider than the site's reading measure on purpose. A footer holding
          three fields and five destinations is a plate, not a column of prose:
          letting it run out to 100rem gives the index room to sit on one line
          at any desktop width, and keeps the hairlines long enough to read as
          structure rather than as boxes. */}
      <div className="relative mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* ── Ownership and the three answers ──────────────────────────────
            Logos left, contact right. On a phone the columns stack and the
            hairlines drop away rather than turning into a stack of boxes.

            Below `sm` the whole plate centres. Stacked, the left edge is no
            longer doing any work — there is no second column for a value to
            line up against and no hairline for it to sit beside, so a column of
            short fields ranged left on a narrow screen reads as a list that has
            lost its container rather than as a plate. Centred, each label sits
            over its own value on one axis and the two logos above them share
            it. Everything from `sm` up is unchanged: the moment the three
            fields go side by side the left edge is structural again. */}
        <div
          data-reveal
          className="grid gap-12 border-b border-white/10 py-14 md:grid-cols-12 md:items-center md:gap-10 lg:py-20"
        >
          <div className="flex items-center gap-6 max-sm:justify-center md:col-span-4">
            {/* Black artwork on transparency — the same brightness/invert
                treatment the navbar gives it over the hero film. */}
            <img
              src={revoltLogo}
              alt={SITE.name}
              className="h-10 w-auto shrink-0 brightness-0 invert lg:h-12"
            />
            <span aria-hidden="true" className="h-11 w-px shrink-0 bg-white/15 lg:h-14" />
            {/* In colour. Knocked to white it becomes a grey disc. */}
            <img src={dugarLogo} alt="MV Dugar Group" className="h-11 w-auto shrink-0 lg:h-14" />
          </div>

          <div className="grid gap-10 max-sm:text-center sm:grid-cols-3 sm:gap-0 md:col-span-8">
            <div className="sm:pr-8">
              <p className={LABEL}>Visit</p>
              <p className="mt-4 font-display text-xl leading-snug text-white/90 lg:text-[1.375rem]">
                {CONTACT.address}
              </p>
            </div>

            <div className="sm:border-l sm:border-white/10 sm:pr-8 sm:pl-8 lg:pl-12">
              <p className={LABEL}>Call</p>
              <a href={`tel:${CONTACT.phone}`} className={cn(VALUE, 'mt-4')}>
                {CONTACT.phone}
              </a>
            </div>

            <div className="sm:border-l sm:border-white/10 sm:pl-8 lg:pl-12">
              <p className={LABEL}>Email</p>
              <a href={`mailto:${CONTACT.email}`} className={cn(VALUE, 'mt-4 break-all')}>
                {CONTACT.email}
              </a>
            </div>
          </div>
        </div>

        {/* ── The index ────────────────────────────────────────────────────
            Every destination on the site, numbered. Cells rather than a row of
            links: the whole cell is the target, which on a phone is the
            difference between a 20px word and a 64px band. */}
        <nav aria-label="Footer" data-reveal className="border-b border-white/10">
          {/* Six across only from xl.
              
              The row went to six the moment Leadership was added, and six equal
              cells is a width problem before it is a design one: the longest
              label is "Motorcycles" and the widest cell at lg is about 160px
              once the index and the padding are taken out, so "05 Leadership"
              ran into its own divider. Three across holds the whole middle band
              instead — one clean row of three, then a second — and the six-wide
              line only appears where six labels genuinely fit. */}
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {NAV_LINKS.map((link, index) => (
              <li
                key={link.to}
                className={cn(
                  // Named so the cell's position in the row can drive the
                  // link's padding — `first:`/`odd:` on the link itself would
                  // match every link, since each is the only child of its cell.
                  'group/cell',
                  'border-b border-white/10 last:border-b-0 md:border-b-0',
                  'sm:even:border-l sm:even:border-white/10',
                  'md:border-l md:border-white/10 md:first:border-l-0',
                  // The cell that opens a row has no rule on its left. At three
                  // across that is every fourth one, and without this the second
                  // row starts with a hairline hanging off the container edge.
                  'md:max-xl:[&:nth-child(3n+1)]:border-l-0',
                  // Two rows at md and lg, so the first row needs a floor.
                  'md:max-xl:[&:nth-child(-n+3)]:border-b md:max-xl:[&:nth-child(-n+3)]:border-white/10',
                )}
              >
                <Link
                  // `jumpTo` where an entry sets one — the destination a plain
                  // link should reach, which is not always the canonical route.
                  // See the Vehicles entry in `constants/site.js`.
                  to={link.jumpTo ?? link.to}
                  className={cn(
                    'group flex items-baseline gap-4 py-7 lg:gap-5 lg:py-10',
                    // Every cell holds its number clear of the rule on its
                    // left; only the cell that starts a row drops the padding,
                    // so its index lines up with the logo above it instead of
                    // being indented away from the container edge.
                    // Scoped to the two-column band only — left unbounded it
                    // would keep stripping the padding from cells 3 and 5 once
                    // the row widens.
                    'sm:px-5 sm:max-md:group-odd/cell:pl-0',
                    // Every third cell starts a row in the middle band, so that
                    // is the one whose padding drops — the same rule the two-
                    // column band above applies to the odd cells.
                    'md:px-5 md:max-xl:group-[&:nth-child(3n+1)]/cell:pl-0',
                    'lg:px-6',
                    'xl:px-7 xl:group-first/cell:pl-0',
                    'transition-colors duration-300',
                    EASE,
                    'hover:bg-white/[0.04]',
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'text-xs tabular-nums text-white/30',
                      'transition-colors duration-300',
                      EASE,
                      'group-hover:text-brand-500',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={cn(
                      'font-display text-xl font-extrabold uppercase tracking-[-0.01em] text-white/90 lg:text-2xl',
                      'transition-colors duration-300',
                      EASE,
                      'group-hover:text-white',
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Small print ──────────────────────────────────────────────────
            One line: who owns it, the small print, and who built it. */}
        <div
          data-reveal
          className="flex flex-col gap-5 py-9 max-sm:items-center max-sm:text-center sm:grid sm:grid-cols-3 sm:items-center"
        >
          <p className="text-sm text-white/45">
            &copy; {year} {SITE.name}. All rights reserved.
          </p>

          {/* Centre of the row on a wide screen, its own line on a phone.
              Neither route exists yet — /terms and /privacy currently resolve
              to the 404 page until the pages are written and added to
              AppRoutes. */}
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-self-center">
            {LEGAL_LINKS.map((legal) => (
              <li
                key={legal.to}
                // The separator is the list item's own marker rather than an
                // element between the links, so nothing empty lands in the
                // accessibility tree and the first item simply has none.
                className={cn(
                  'flex items-center gap-x-4',
                  "before:block before:size-1 before:rounded-full before:bg-white/25 before:content-['']",
                  'first:before:hidden',
                )}
              >
                <Link
                  to={legal.to}
                  className={cn(
                    'text-sm text-white/45',
                    'transition-colors duration-300',
                    EASE,
                    'hover:text-white',
                    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
                  )}
                >
                  {legal.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-sm text-white/45 sm:justify-self-end">
            Developed by{' '}
            {/* Underlined, unlike the legal links beside it. Those sit in a row
                of their own where position marks them as links; this one is a
                name inside a sentence, and mid-sentence the only thing telling
                a reader it can be clicked is the rule under it. The site's
                other inline links are set the same way. */}
            <a
              href={DEVELOPER.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'text-white/70 underline decoration-white/25 underline-offset-4',
                'transition-colors duration-300',
                EASE,
                'hover:text-white hover:decoration-white/60',
                'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
              )}
            >
              {DEVELOPER.name}
            </a>
          </p>
        </div>
      </div>

      {/* Room at the foot of the page for the marque the field draws there.
          Empty on purpose: the word is painted by the canvas behind everything,
          and it runs off the bottom edge of the document rather than sitting
          centred in a band, so it reads as a surface continuing past the page. */}
      <div aria-hidden="true" className="h-32 sm:h-48 lg:h-64 xl:h-72" />

    </footer>
  )
}
