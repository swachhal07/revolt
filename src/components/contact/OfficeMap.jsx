import { useState } from 'react'
import Button from '@/components/ui/Button'
import { ArrowUpRight } from '@/components/ui/icons'
import { CONTACT, SITE } from '@/constants/site'
import { cn } from '@/utils/cn'

/**
 * The office map, as an instrument rather than an embed.
 *
 * A Google iframe dropped straight onto a page brings two problems with it. It
 * eats the scroll — a phone thumb travelling down the page hits the map and pans
 * it instead — and it arrives with its own visual language, which is nobody's
 * brand. So it is framed and gated.
 *
 *   1. A readout above it: what you are looking at on the left, the coordinate
 *      and the map's own state on the right. The state is the honest part —
 *      "static" says the thing under it is a picture and not yet a map.
 *   2. The map starts inert. `pointer-events-none` on the iframe and one pill
 *      over it; a press turns both off, the readout flips to "live", and from
 *      then on it drags, zooms and behaves like Google's. Nobody loses the page
 *      by scrolling, and nobody who wants the map is stopped by more than a tap.
 *   3. One pill under it for the thing most people actually want, which is not
 *      to pan a map but to be given the route.
 *
 * `loading="lazy"` — a map at the foot of a contact page should not be fetched
 * by someone who never scrolled to it.
 *
 * The location comes from `CONTACT.coords` in `constants/site.js` and feeds both
 * the embed and the directions link, so the pin and the route can never point at
 * two different places. The phone and hours beside it are real; the email is
 * still a stub.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const META = 'text-[11px] font-semibold tracking-[0.2em] uppercase'

// Neither URL needs a Google API key: `output=embed` is the public embed
// endpoint and `maps/dir` the public directions deep link.
//
// The embed is addressed by coordinate rather than by name, and `iwloc=` is
// passed empty. Searching by name makes Google resolve a *place*, and a resolved
// place opens its own info window over the map — a white card with the listing's
// name, address and "No reviews" in Google's typography, sitting on top of the
// one corner this component reserves for its own pill. A coordinate has no
// listing to advertise, and the empty `iwloc` suppresses the bubble outright, so
// what is left is the map and the pin.
//
// Directions go to the same coordinate as a destination rather than as a search:
// a search hands the rider a list of results to pick from, a destination hands
// them a route.
const { lat, lng } = CONTACT.coords

const MAP_EMBED_URL = `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed&iwloc=`

const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

const READOUT = `${CONTACT.coords.lat.toFixed(4)}° N · ${CONTACT.coords.lng.toFixed(4)}° E`

export default function OfficeMap() {
  const [live, setLive] = useState(false)

  return (
    <div>
      {/* ── The readout ──────────────────────────────────────────────────
          A dash rather than a bullet in front of the name — the same mark the
          form uses for a compulsory field, so the sheet and the map are drawn
          with one vocabulary. The coordinate sits out below sm, where it would
          be the third thing competing for a line that only has room for two. */}
      <div className="flex items-center justify-between gap-6 border-b border-ink-900/12 pb-4">
        <p className={cn('flex min-w-0 items-center gap-3 text-ink-800', META)}>
          <span aria-hidden="true" className="h-[2px] w-4 shrink-0 bg-brand-500" />
          <span className="truncate">{SITE.name} head office</span>
        </p>

        <p className={cn('flex shrink-0 items-center gap-5 text-ink-500 sm:gap-7', META)}>
          <span className="hidden tabular-nums sm:inline">{READOUT}</span>

          {/* The state, and the only thing on the page that changes on click:
              a grey dot for a picture, a live one for a map. `aria-live` so the
              flip is announced rather than only seen. */}
          <span className="flex items-center gap-2" aria-live="polite">
            <span
              aria-hidden="true"
              className={cn(
                'size-1.5 rounded-full transition-colors duration-500',
                EASE,
                live ? 'bg-volt-500' : 'bg-ink-900/25',
              )}
            />
            {live ? 'Live' : 'Static'}
          </span>
        </p>
      </div>

      <div className="relative mt-4">
        <div className="h-[320px] overflow-hidden border border-ink-900/12 bg-ink-50 sm:h-[420px] lg:h-[520px]">
          <iframe
            title={`Map of ${SITE.name} — ${CONTACT.address}`}
            src={MAP_EMBED_URL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            tabIndex={live ? 0 : -1}
            className={cn('size-full border-0', !live && 'pointer-events-none')}
          />
        </div>

        {/* ── The gate ────────────────────────────────────────────────────
            The whole map is the target, so a press anywhere wakes it; the pill
            is only where the instruction is legible. It sits top-left rather
            than centred because the pin is usually in the middle, and covering
            the pin to say "tap to move the map" is telling somebody to move
            the thing you are standing on. */}
        {!live && (
          <button
            type="button"
            onClick={() => setLive(true)}
            aria-label="Activate the map so it can be panned and zoomed"
            className={cn(
              'group absolute inset-0 flex items-start justify-start p-4 sm:p-5',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
            )}
          >
            <span
              className={cn(
                'inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-ink-900',
                'shadow-[0_18px_40px_-24px_rgba(5,5,5,0.45)] ring-1 ring-ink-900/[0.06]',
                'transition-transform duration-500',
                EASE,
                'group-hover:-translate-y-0.5',
              )}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-500" />
              <span className={META}>Tap to move the map</span>
            </span>
          </button>
        )}
      </div>

      {/* Centred, because it answers the map above it rather than the column of
          text further up — and it is the only pill on a page whose other action
          is a full-width bar, so it cannot be mistaken for the submit. */}
      <div className="mt-6 flex justify-center">
        <Button
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          size="lg"
          trailingIcon={<ArrowUpRight className="size-4" />}
        >
          Get directions
        </Button>
      </div>
    </div>
  )
}
