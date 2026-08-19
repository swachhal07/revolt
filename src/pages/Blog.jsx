import { Link } from 'react-router-dom'
import Container from '@/components/ui/Container'
import { ArrowUpRight } from '@/components/ui/icons'
import { useMounted } from '@/hooks/useReveal'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { POSTS, formatPostDate, getFeaturedPost } from '@/data/posts'
import { cn } from '@/utils/cn'

/**
 * The journal: a nameplate, one lead note, then everything else three up.
 *
 * A blog index has one job — get somebody into a post — and six equal cards in a
 * row does it badly on its own, because nothing in the grid says which of the six
 * is worth an afternoon. So the page ranks once and then stops ranking.
 *
 *   1. A nameplate. Named and stated across one rule-flanked strip, the gesture
 *      the rest of the site opens sections with.
 *   2. One lead note at display size, cover taking half the width. If a visitor
 *      reads one thing it is this one, and the layout says so.
 *   3. The rest as a three-up grid on a band a shade off the paper. Under the
 *      lead they are of equal standing, and a grid is how you say that — numbered
 *      rows would claim an order that is not there.
 *
 * Cards with no enclosure: the cover carries the radius and the shadow, and the
 * meta, title, standfirst and link sit straight on the band underneath it. The
 * only thing holding a column together is alignment, which is all a card ever
 * needed.
 *
 * PLACEHOLDER DATA — every note in `data/posts.js` is written copy against
 * stand-in covers pulled from the app screenshots in `assets/images`.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const LABEL = 'text-[11px] font-semibold tracking-[0.2em] uppercase'

/** The separator in the meta line. Decorative, so it is hidden from readers who
 *  are being read the line rather than looking at it. */
function Dot() {
  return (
    <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-ink-900/20" />
  )
}

export default function Blog() {
  const mounted = useMounted()
  // The nameplate and the lead ride `mounted` — they are above the fold, so
  // their entrance belongs to the page load rather than to a scroll. The index
  // below is scroll-driven: heading, then the six cards in order. See
  // [[useScrollReveal]].
  const indexRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.07 })

  const featured = getFeaturedPost()

  // The lead is taken out of the grid rather than repeated in it — a note cannot
  // be both the page's lead and a card in the set underneath it.
  const rows = POSTS.filter((post) => post.slug !== featured.slug)

  // Spread onto the element. The delay is inline rather than a `delay-*` class
  // because it is a value, not a token — and it drops to zero on the way out so
  // a stagger never plays backwards.
  const enter = (shown, delay, className) => ({
    style: { transitionDelay: shown ? `${delay}ms` : '0ms' },
    className: cn(
      'transition-[opacity,transform] duration-700',
      EASE,
      shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      className,
    ),
  })

  return (
    <>
      {/* ── The nameplate ─────────────────────────────────────────────────
          The top padding is the fixed navbar, not a design decision: 5.5rem is
          the first value that clears the bar's 48px logo and its `py-5` on a
          phone, 6rem the first that clears the 56px one from sm. Anything more
          is dead space above a nameplate. */}
      <section className="pt-20 pb-0 sm:pt-22">
        <Container className="max-w-[84rem]">
          <div {...enter(mounted, 0)}>
            <div className="flex items-center gap-5">
              <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
              <p className={cn(LABEL, 'text-brand-600')}>Field notes</p>
              <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            </div>
          </div>

          {/* Centred and set at the site's masthead scale. The red sits on the
              noun the page is about; the full stop stays black. */}
          <h1
            {...enter(
              mounted,
              60,
              'mx-auto mt-4 max-w-[18ch] text-center font-display text-[clamp(2.5rem,7vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.045em] text-ink-900 text-balance sm:mt-5',
            )}
          >
            Everything we learned <span className="text-brand-600">riding</span> these.
          </h1>

          <p
            {...enter(
              mounted,
              140,
              'mx-auto mt-3 max-w-[52ch] text-center text-[15.5px] leading-relaxed text-ink-500 text-pretty',
            )}
          >
            Range on real hills, charging from a rented flat, what a battery does over five years.
            Written by the people who service these bikes, not by a marketing desk.
          </p>
        </Container>
      </section>

      {/* ── The lead ──────────────────────────────────────────────────────
          Cover on the left, story on the right, and the cover in a tray rather
          than flat on the page: an outer shell with 8px of padding and a
          hairline, an inner plate with its own radius. The two curves are
          concentric on purpose — the same enclosure the contact page uses, so a
          photograph on this site is always seated in something.

          The whole card is one link. A title link plus a "read more" plus a
          clickable image is three targets for one destination. */}
      <section className="pt-6 pb-16 sm:pt-7 sm:pb-20">
        <Container className="max-w-[84rem]">
          <Link
            to={`/blog/${featured.slug}`}
            {...enter(
              mounted,
              220,
              cn(
                'group grid gap-8 border-t border-ink-900/12 pt-3 lg:grid-cols-12 lg:gap-14 lg:pt-4',
                'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
              ),
            )}
          >
            {/* Six columns on a 16/11 crop, with the tray's padding at 6px. Seven
                columns on a 16/10 was 670 × 420 — that much photograph is taller
                than the whole block of type beside it, and the lead should be the
                largest thing on the page rather than the tallest. Six splits the
                spread evenly and lands the cover a shade under the title block's
                own height. */}
            <div className="lg:col-span-6">
              <div className="rounded-[1.75rem] bg-ink-50/80 p-1.5 ring-1 ring-ink-900/[0.06]">
                <div className="overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-ink-50">
                  <img
                    src={featured.cover}
                    alt={featured.coverAlt}
                    loading="eager"
                    className={cn(
                      'aspect-[16/11] w-full object-cover',
                      // Scale, not a filter or a shadow: it is the only property
                      // here that costs nothing to animate.
                      'transition-transform duration-[1200ms]',
                      EASE,
                      'group-hover:scale-[1.03]',
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Ranged left, but sat in the middle of its own half rather than
                pinned to the column's left edge: the standfirst runs to 46
                characters and the title to two lines, so left-pinning left a
                wedge of empty paper down the right of the spread and the two
                halves stopped looking like a pair. */}
            <div className="flex flex-col justify-center lg:col-span-6 lg:mx-auto lg:max-w-[34rem]">
              <p className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', LABEL)}>
                <span className="text-brand-600">Lead note</span>
                <span aria-hidden="true" className="h-px w-6 bg-ink-900/20" />
                <span className="text-ink-500">{featured.category}</span>
                <span className="text-ink-500">{formatPostDate(featured.date)}</span>
              </p>

              <h2
                className={cn(
                  'mt-6 font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.05] font-extrabold tracking-[-0.035em] text-ink-900 text-balance',
                  'transition-colors duration-500',
                  EASE,
                  'group-hover:text-brand-600',
                )}
              >
                {featured.title}
              </h2>

              <p className="mt-5 max-w-[46ch] text-[15.5px] leading-relaxed text-ink-500 text-pretty">
                {featured.standfirst}
              </p>

              {/* Not a button. The card is the target, so this is a marker for
                  where the card goes — the glyph in its own circle, which is how
                  every arrow on this site is set. */}
              <span className="mt-8 flex items-center gap-3 text-sm font-semibold text-ink-900">
                Read the note
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full bg-ink-900/[0.06] text-ink-900',
                    'transition-transform duration-500',
                    EASE,
                    'group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105',
                  )}
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </span>

              <p className="mt-6 text-[13px] text-ink-500">
                {featured.author} · {featured.read} min read
              </p>
            </div>
          </Link>
        </Container>
      </section>

      {/* ── The archive ─────────────────────────────────────────────
          On the same paper as the lead above it. A grey band was separating the
          two, which the hairline over the heading already does — and a tinted
          band behind six white-shadowed covers put a second near-white in the
          frame for no gain. White, and the rule carries the division.

          Three up, and cards rather than the ruled rows this held before: rows
          rank a list, and everything under the lead is already unranked — six
          notes of equal standing, which is what a grid says and a numbered index
          does not. No enclosure round each one either. The cover is the card:
          image, then meta, then title, then the line, sitting straight on the
          sheet with air between the columns doing the separating. */}
      <section ref={indexRef} className="pt-6 pb-24 sm:pt-8 sm:pb-28 lg:pb-32">
        <Container className="max-w-[84rem]">
          <div
            data-reveal
            className="flex items-baseline justify-between gap-6 border-t border-ink-900/12 pt-7"
          >
            <h2 className="font-display text-[1.5rem] leading-none font-extrabold tracking-[-0.03em] text-ink-900 sm:text-[1.75rem]">
              Latest notes
            </h2>

            <p className={cn(LABEL, 'shrink-0 text-ink-500')}>
              <span className="tabular-nums">{String(rows.length).padStart(2, '0')}</span> notes
            </p>
          </div>

          <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-x-10">
            {rows.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  data-reveal
                  className={cn(
                    'group flex h-full flex-col',
                    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
                  )}
                >
                  {/* The cover carries the radius and a shadow tinted to the
                      band rather than a grey halo, so it reads as seated on the
                      paper and lit from above. No tray at this size — a 8px
                      frame round a 300px image is a border, not an enclosure. */}
                  <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_24px_50px_-30px_rgba(5,5,5,0.35)]">
                    <img
                      src={post.cover}
                      alt={post.coverAlt}
                      loading="lazy"
                      className={cn(
                        'aspect-[4/3] w-full object-cover',
                        'transition-transform duration-[1200ms]',
                        EASE,
                        'group-hover:scale-[1.04]',
                      )}
                    />
                  </div>

                  {/* Category in red, the rest grey, dots between: one line that
                      says what kind of note this is, when it was filed and what
                      it costs to read. */}
                  <p className={cn('mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1', LABEL)}>
                    <span className="text-brand-600">{post.category}</span>
                    <Dot />
                    <span className="text-ink-500">{formatPostDate(post.date)}</span>
                    <Dot />
                    <span className="text-ink-500">{post.read} min read</span>
                  </p>

                  <h3
                    className={cn(
                      'mt-4 font-display text-[1.375rem] leading-[1.15] font-extrabold tracking-[-0.025em] text-ink-900 text-balance',
                      'transition-colors duration-500',
                      EASE,
                      'group-hover:text-brand-600',
                    )}
                  >
                    {post.title}
                  </h3>

                  <p className="mt-4 text-[14.5px] leading-[1.65] text-ink-500 text-pretty">
                    {post.standfirst}
                  </p>

                  {/* `mt-auto` so the line sits on the foot of the tallest card
                      in the row — three cards with standfirsts of different
                      lengths would otherwise each end wherever their copy did,
                      and the row would lose its baseline. */}
                  <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-ink-900">
                    Read the note
                    <ArrowUpRight
                      className={cn(
                        'size-3.5 text-brand-600 transition-transform duration-500',
                        EASE,
                        'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
                      )}
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  )
}
