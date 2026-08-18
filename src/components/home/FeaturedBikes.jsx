import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Container from '@/components/ui/Container'
import { ChevronRight } from '@/components/ui/icons'
import { useReveal } from '@/hooks/useReveal'
import { MOTORCYCLES } from '@/data/motorcycles'
import { cn } from '@/utils/cn'

/**
 * The lineup, straight under the hero: every model side by side on white so
 * the bikes carry the fold and nothing else competes with them.
 *
 * Three equal columns is the most generic shape a feature row can take, so the
 * differentiation is all in the detail — no badges, no rules, and a cast shadow
 * under each cutout so it does not read as pasted on. The columns
 * align across, not just down. The surface stays plain white; the bikes are the
 * only texture the section gets. Specs and price live on the detail pages.
 *
 * White, not the hero's black. The cutouts are shot on white, so a dark
 * surface would ring every bike with a grey halo.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

export default function FeaturedBikes() {
  const [ref, shown] = useReveal()
  const trackRef = useRef(null)
  // Which arrows are live. All three columns fit above `lg`, so on a desktop
  // both stay hidden; below it the track scrolls and they earn their place.
  const [scroll, setScroll] = useState({ start: true, end: true })

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    // 2px of slack: fractional scroll offsets never land exactly on the end.
    const max = track.scrollWidth - track.clientWidth
    setScroll({
      start: track.scrollLeft <= 2,
      end: track.scrollLeft >= max - 2,
    })
  }, [])

  // Before paint, so the arrows are never wrong on the first frame.
  useLayoutEffect(measure, [measure])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    track.addEventListener('scroll', measure, { passive: true })

    // Crossing the lg breakpoint changes whether the track overflows at all.
    // The resize listener is the floor: without it a browser lacking
    // ResizeObserver would keep the arrows hidden on a track that overflows.
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(track)
    window.addEventListener('resize', measure)

    return () => {
      track.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      observer?.disconnect()
    }
  }, [measure])

  // Steps by one column rather than a full viewport — a half-visible bike is
  // the affordance that tells you there is another one.
  const step = (direction) => {
    const track = trackRef.current
    if (!track) return

    const column = track.firstElementChild?.getBoundingClientRect().width ?? 0
    // Read the gap rather than hardcode it — it changes at two breakpoints.
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
    track.scrollBy({ left: direction * (column + gap), behavior: 'smooth' })
  }

  const atBothEnds = scroll.start && scroll.end

  return (
    // Bottom carries more air than the top: the hero hands straight off to the
    // headline, and the row below needs room before the next section starts.
    <section ref={ref} className="overflow-hidden bg-white pt-16 pb-24 sm:pt-20 sm:pb-32">
      <Container>
        {/* No kicker. "The lineup" over a row of motorcycles named what the
            reader could already see, and it was one of three tracked-caps
            eyebrows on this page — the tell that a layout is being scaffolded
            rather than composed. The heading opens the section on its own. */}
        <h2
          className={cn(
            'text-center font-display font-bold uppercase text-ink-900',
            // One line at every width, so the size has to follow the viewport
            // rather than a fixed scale — and the cap keeps it from outgrowing
            // the container's own max width on a wide monitor.
            //
            // Tracking was +0.06em for Clash Display, a narrow display face whose
            // caps need prising apart. Plus Jakarta Sans is wide and round to
            // begin with; at that value the line read as spaced-out lettering
            // rather than a heading. +0.01em is the small amount uppercase still
            // wants, and the words come back as words.
            'text-[clamp(0.9rem,4.3vw,3.25rem)] leading-[1.1] tracking-[0.01em] whitespace-nowrap',
            'transition-[transform,opacity] duration-700',
            EASE,
            shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
          )}
        >
          Choose your <span className="text-brand-500">electric machine</span>
        </h2>
      </Container>

      {/* The rail sits outside Container so the arrows can hug the viewport
          edges the way the columns cannot. */}
      <div className="relative mt-24 sm:mt-28">
        {[
          { dir: -1, label: 'Previous model', side: 'left-2 sm:left-4', disabled: scroll.start },
          { dir: 1, label: 'Next model', side: 'right-2 sm:right-4', disabled: scroll.end },
        ].map((arrow) => (
          <button
            key={arrow.label}
            type="button"
            onClick={() => step(arrow.dir)}
            disabled={arrow.disabled}
            aria-label={arrow.label}
            // Both ends reachable at once means nothing overflows — the whole
            // control is dead weight, so it leaves rather than sits greyed out.
            className={cn(
              'absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full',
              'transition-[background-color,opacity] duration-300',
              EASE,
              'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
              arrow.disabled
                ? 'bg-ink-900/20 text-white'
                : 'bg-ink-900 text-white hover:bg-brand-600',
              atBothEnds && 'hidden',
              arrow.side,
            )}
          >
            <ChevronRight className={cn('size-5', arrow.dir === -1 && 'rotate-180')} />
          </button>
        ))}

        <div
          ref={trackRef}
          // `scrollbar-width: none` has no Tailwind utility; the arrows and the
          // snap points are the affordance here, a visible bar just adds noise.
          style={{ scrollbarWidth: 'none' }}
          className={cn(
            'flex snap-x snap-mandatory gap-16 overflow-x-auto overscroll-x-contain px-4 sm:gap-20 sm:px-6 lg:gap-24 lg:px-8',
            // Centres the three columns once they stop overflowing, so the row
            // reads as a grid on a desktop and a rail on a phone.
            'lg:justify-center lg:overflow-x-visible',
            '[&::-webkit-scrollbar]:hidden',
          )}
        >
          {MOTORCYCLES.map((bike, i) => (
            <article
              key={bike.slug}
              className={cn(
                'group flex w-[78vw] shrink-0 snap-center flex-col',
                'sm:w-[46vw] lg:w-auto lg:max-w-md lg:flex-1',
                'transition-[transform,opacity] duration-700',
                EASE,
                shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
              )}
              // Columns land left to right rather than all at once.
              style={{ transitionDelay: shown ? `${i * 90}ms` : '0ms' }}
            >
              {/* Name over class, both centred. The class sat hard right for a
                  while and at this column width it drifted closer to the next
                  bike's name than to its own. No rule and no badge here — the
                  spacing does the separating. */}
              <div className="flex flex-col items-center gap-2.5 pb-4 text-center">
                <h3 className="font-display text-2xl font-bold tracking-[0.02em] text-ink-900 sm:text-[1.75rem]">
                  {bike.name}
                </h3>
                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-ink-500">
                  {bike.class}
                </span>
              </div>

              {/* Fixed aspect so three bikes of different lengths still share a
                  baseline and the row never goes ragged. The photograph is
                  taken out of flow below: `aspect-ratio` only sets a preferred
                  height, so an in-flow image taller than the ratio stretches
                  its own box and drops that column out of alignment with the
                  two beside it — and lazy neighbours would do it on load. */}
              <div className="relative mt-10 aspect-4/3 w-full">
                {/* Cast shadow. Without it the cutout floats — and it is tinted
                    with the ink hue rather than pure black. */}
                <div
                  aria-hidden="true"
                  className={cn(
                    'absolute bottom-[8%] left-1/2 h-5 w-[70%] -translate-x-1/2 rounded-[50%]',
                    'bg-ink-900/15 blur-xl',
                    'transition-[transform,opacity] duration-500',
                    EASE,
                    'group-hover:scale-x-105 group-hover:opacity-70',
                  )}
                />
                <img
                  src={bike.studio}
                  alt={`${bike.name} — ${bike.tagline}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className={cn(
                    'absolute inset-0 size-full object-contain',
                    'transition-transform duration-500',
                    EASE,
                    // Lifts off its shadow rather than just scaling up.
                    'group-hover:-translate-y-2',
                  )}
                />
              </div>

              {/* Deliberately inert: this used to open the bike's detail page,
                  and it does not navigate any more. A span rather than a dead
                  <Link> or a no-op <button> — a control that announces itself to
                  a screen reader or takes a tab stop and then does nothing is
                  worse than plain text. The card's hover still animates it, so
                  it reads as part of the card rather than as a broken link. */}
              <span
                className={cn(
                  'mt-8 inline-flex items-center gap-2 self-center text-xs font-semibold tracking-[0.16em] uppercase',
                  'text-ink-900 underline decoration-ink-900/25 decoration-1 underline-offset-[7px]',
                  'transition-colors duration-300',
                  EASE,
                  'group-hover:text-brand-600 group-hover:decoration-brand-600',
                )}
              >
                Configure
                <ChevronRight
                  className={cn(
                    'size-3 transition-transform duration-300',
                    EASE,
                    'group-hover:translate-x-1',
                  )}
                />
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
