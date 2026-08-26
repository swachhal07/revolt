import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight } from '@/components/ui/icons'
import { useLineup } from '@/hooks/useCollection'
import { MOTORCYCLES } from '@/data/motorcycles'
import { cn } from '@/utils/cn'

/**
 * The lineup, as a panel under the bar.
 *
 * A drop-down list of six model names would have been the smaller build, but a
 * motorcycle is not a menu item — it is the thing being sold, and a reader who
 * cannot tell an RVX from an RV1 by name can tell them apart instantly by
 * shape. So the panel is the lineup itself: every model, its class, its cutout,
 * and the way into its page.
 *
 * Full-bleed rather than a card hanging off the trigger. A panel that spans the
 * bar reads as the bar opening; a floating rounded box reads as a widget landing
 * on top of the page, and this site has no other rounded floating surfaces.
 *
 * Grey, not white. The bar above it is white and the panel has to separate from
 * it without a heavy rule — ink-50 is the one step down the scale that does it
 * while staying light enough not to ring the cutouts, which are shot on white.
 * The same reason FeaturedBikes gives for keeping its own surface pale.
 *
 * Rendered at all times and hidden with `visibility`, not unmounted. Visibility
 * takes the panel out of the tab order and out of the accessibility tree for
 * free — no `inert`, no focus trap to maintain — and it is the one hiding
 * mechanism that still allows the opacity and lift to animate on the way in.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

export default function LineupMenu({ id, open, onClose, onKeepOpen }) {
  const panel = useRef(null)

  // The lineup the back office holds, with the bundled catalogue as the
  // fallback — see [[useLineup]]. The panel is mounted at all times rather than
  // on open, so this read happens once on load and the menu is already correct
  // the first time it is pulled down.
  const { bikes } = useLineup(MOTORCYCLES)

  // Escape closes from anywhere in the panel — including from a link deep in
  // the grid, which is where a keyboard reader will actually be when they
  // decide they picked the wrong menu. Bound to the document rather than the
  // panel so it also fires while focus is still on the trigger.
  useEffect(() => {
    if (!open) return

    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      id={id}
      ref={panel}
      onMouseEnter={onKeepOpen}
      // Tabbing out of the last link closes the panel. `relatedTarget` is where
      // focus is going, so a move between two links inside the grid — which
      // reports as a blur on the panel too — is told apart from a move out of
      // it.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose()
      }}
      className={cn(
        'absolute inset-x-0 top-full hidden border-b border-ink-900/10 bg-ink-50 lg:block',
        // Taller than a laptop viewport once the grid wraps to two rows, so the
        // panel scrolls rather than running off the bottom of the screen.
        'max-h-[calc(100dvh-6rem)] overflow-y-auto',
        'transition-[opacity,transform,visibility] duration-300',
        EASE,
        open
          ? 'visible translate-y-0 opacity-100'
          : 'invisible -translate-y-2 opacity-0',
      )}
    >
      <div className="mx-auto max-w-[1600px] px-6 pt-10 pb-12 lg:px-10">
        {/* Six across on a wide screen, three on a laptop — the wrap is what
            keeps the cutouts big enough to be told apart. Row gap is larger
            than the column gap for the wrapped case: two rows of motorcycles
            need air between them or the second row reads as a reflection of
            the first. */}
        <ul className="grid grid-cols-3 gap-x-8 gap-y-12 xl:grid-cols-6 xl:gap-x-6">
          {bikes.map((bike) => (
            <li key={bike.slug}>
              <Link
                to={`/motorcycles/${bike.slug}`}
                className="group block text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
              >
                {/* Name over class, both centred on the cutout below — the same
                    pairing FeaturedBikes sets over each bike in the rail.
                    Left-aligned, a short name like RV1 sat a long way from the
                    machine it labels while RV400 BRZ ran most of the cell's
                    width, so the row of headings read as unevenly spaced rather
                    than as one label per bike. Centred, every name is over its
                    own bike — which is also the only thing now marking where
                    one cell ends and the next begins, the corner marks having
                    come out. */}
                <h3 className="font-display text-xl font-bold tracking-[0.02em] text-ink-900 uppercase">
                  {bike.name}
                </h3>
                <span className="mt-1.5 block text-[10px] font-semibold tracking-[0.18em] text-ink-500 uppercase">
                  {bike.class}
                </span>

                {/* Fixed ratio so six bikes of different lengths share a
                    baseline and the row cannot go ragged — the same reason the
                    home page's rail fixes its own. */}
                <div className="relative mt-6 aspect-4/3 w-full">
                  <img
                    src={bike.studio}
                    alt={
                      bike.tagline
                        ? `${bike.name} — ${bike.tagline}`
                        : `${bike.name}, ${bike.class}`
                    }
                    loading="lazy"
                    className={cn(
                      'absolute inset-0 size-full object-contain',
                      'transition-transform duration-500',
                      EASE,
                      'group-hover:-translate-y-1.5',
                    )}
                  />
                </div>

                {/* The same control the lineup rail sets under each bike, and
                    deliberately so — except that this one navigates, which the
                    rail's does not. Named for the model rather than reading
                    "Explore": six cells of identical link text is six identical
                    announcements to a screen reader running the links list. */}
                <span
                  className={cn(
                    'mt-4 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase',
                    'text-ink-900 underline decoration-ink-900/25 decoration-1 underline-offset-[7px]',
                    'transition-colors duration-300',
                    EASE,
                    'group-hover:text-brand-600 group-hover:decoration-brand-600',
                  )}
                >
                  Explore {bike.name}
                  <ChevronRight
                    className={cn(
                      'size-3 transition-transform duration-300',
                      EASE,
                      'group-hover:translate-x-1',
                    )}
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* The panel's one call to action. It closes the row of models with the
            thing somebody browsing them is actually working towards — the
            enquiry is pre-set to the test ride, so the chip is already chosen
            by the time the form loads. */}
        <div className="mt-12 border-t border-ink-900/10 pt-6">
          <Link
            to="/contact?enquiry=test-ride"
            className={cn(
              'group inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.16em] text-ink-500 uppercase',
              'transition-colors duration-300',
              EASE,
              'hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
            )}
          >
            Book a test ride
            <ArrowRight
              className={cn(
                'size-3.5 transition-transform duration-300',
                EASE,
                'group-hover:translate-x-1',
              )}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
