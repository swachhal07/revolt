import { Link } from 'react-router-dom'
import { ArrowRight } from '@/components/ui/icons'
import { getLenis } from '@/utils/lenis'
import { formatNpr } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * The opening frame of a model's page: the motorcycle at full bleed, its name
 * over it, and the two things a reader can do about it.
 *
 * The page used to open on a `Section` heading and a grey placeholder box. That
 * is a specification sheet with a title on it — fine for a table of figures and
 * wrong for the first thing said about a product, because the first thing said
 * about a motorcycle is what it looks like.
 *
 * The composition is deliberately corner-loaded. Name and claim top-left, where
 * a reader's eye starts; price and controls bottom-right, where it stops. The
 * middle is left to the photograph, which is the only reason to run an image
 * this large in the first place — a centred stack of type would put the
 * headline over the tank and waste the frame.
 *
 * BELOW THE BAR, NOT BEHIND IT, AND FLUSH TO IT. `RootLayout` gives every page
 * but home 6rem of top padding to clear the fixed navbar, and this section
 * neither cancels that padding nor adds to it: the top edge of the photograph
 * meets the bottom edge of the bar exactly.
 *
 * Both alternatives were tried and are worse. Cancelling the padding with a
 * negative margin ran the picture up behind an opaque white bar, so the top of
 * the frame was simply never seen. Adding a margin on top of it left a thin
 * band of page between the two, which at any width small enough to read as
 * restraint also reads as a seam.
 *
 * The 6rem is subtracted from the height as well, or the frame is pushed past
 * the fold and the section below it starts off-screen.
 *
 * NO INVENTED COMMERCE. The reference this was built against carries a
 * prebooking price, a struck-through list price and an introductory offer. None
 * of those exist as data here and none are guessed at — the cluster prints the
 * price in `motorcycles.js` and nothing else. A bike with no price says so.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

/** Where "View specs" goes. The detail page puts this id on the figures block. */
export const SPECS_ID = 'specs'

export default function DetailHero({ bike }) {
  // Lenis owns the scroll position, so an anchor href would be fought by it
  // rather than eased. Under `prefers-reduced-motion` Lenis is never
  // constructed and `getLenis()` is null — the native jump is the correct
  // answer there, not a fallback.
  const toSpecs = (event) => {
    const target = document.getElementById(SPECS_ID)
    const lenis = getLenis()
    if (!target || !lenis) return

    event.preventDefault()
    lenis.scrollTo(target, { offset: -96 })
  }

  return (
    <section className="relative overflow-hidden bg-ink-950">
      <img
        src={bike.hero ?? bike.image}
        alt={bike.tagline ? `${bike.name} — ${bike.tagline}` : `${bike.name}, ${bike.class}`}
        // The hero of the page the reader asked for: never deferred, and told
        // to jump the queue ahead of everything below the fold.
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover"
      />

      {/* Two scrims, not one. The horizontal wash is what makes the headline
          legible over whatever happens to be on the left of the photograph; the
          vertical one does the same for the price cluster, which sits over the
          road surface where these shots are usually brightest. A single overall
          tint dark enough to carry both would have flattened the picture.
          Written as explicit gradients rather than Tailwind's from/via/to,
          because what matters here is not the two end colours but where the
          dark stops — and the utility scale has no vocabulary for that.

          BOTH FADE OUT WELL BEFORE THE FAR EDGE. The first pass ran the left
          wash at 85% across the full width and the bottom one at 85% over two
          thirds of the height; where they crossed, at the bottom-left, the
          photograph was gone entirely and the frame read as a black panel with
          a motorcycle pasted into the corner of it. The point of running an
          image at this size is that it is visible, so each gradient now clears
          to nothing around the midpoint and the machine sits in open picture. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(5,5,5,0.78)_0%,rgba(5,5,5,0.32)_26%,rgba(5,5,5,0)_56%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(5,5,5,0.72)_0%,rgba(5,5,5,0.12)_38%,rgba(5,5,5,0)_100%)]"
      />

      {/* A third wash, and the only one that is not a band across the frame.
          The price cluster sits bottom-right over the road surface, which in
          these shots is the brightest thing in the picture — a pale grey with
          white lane markings running through it. The bottom band above reaches
          0.72 at the very edge of the frame but the cluster floats clear of that
          edge on the section's own padding, so the label and the fine print were
          landing on open tarmac at roughly a third of the darkness they were
          drawn for.

          Raising the band would have fixed the corner by flattening the whole
          bottom half of the photograph, which is the mistake the two washes
          above were already rewritten once to undo. A radial anchored to the
          bottom-right corner puts the darkness only where the type is and
          clears to nothing about two thirds of the way across, so the machine
          still sits in open picture.

          Right-anchored, and the cluster ranges left below `sm` — but the
          horizontal wash already owns that corner at those widths, so there is
          nothing to add there. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(115%_100%_at_100%_100%,rgba(5,5,5,0.7)_0%,rgba(5,5,5,0.34)_36%,rgba(5,5,5,0)_68%)]"
      />

      <div
        className={cn(
          'relative mx-auto flex max-w-[1600px] flex-col justify-between gap-16 px-6 pt-16 pb-14 lg:px-10 lg:pb-20',
          // The rest of the screen, and not a fraction of it. At 82svh the
          // frame stopped a couple of hundred pixels short of the fold, so the
          // first thing under the motorcycle was a band of white with nothing
          // in it — the page appeared to end before the section below had
          // started. The subtraction is the layout's 6rem of bar clearance, so
          // the frame's bottom edge lands on the fold.
          //
          // `svh`, not `vh`: on a phone `vh` is measured against the viewport
          // with the browser chrome retracted, which leaves the hero taller
          // than the screen until the address bar slides away. `max()` floors
          // it for a short landscape window, where a full-height frame would
          // put the price cluster on top of the headline.
          'min-h-[max(30rem,calc(100svh-6rem))]',
        )}
      >
        <div className="max-w-2xl">
          {/* `font-plate`, the site's one departure from a single family, and
              it lives on this page only. Tracking goes positive rather than
              negative here: Plus Jakarta Sans is wide and round and wanted
              pulling in at this size, Chakra Petch is already angular and
              close-fitting, and tightening it further runs the letters into
              each other. */}
          <h1
            className={cn(
              'font-plate font-bold uppercase text-white',
              'text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] tracking-[0.01em]',
            )}
          >
            {bike.name}
          </h1>

          {/* The class always prints; the tagline only when there is one. A
              model still waiting on its copy gets a shorter block rather than
              an empty line under the name. */}
          <p className="mt-5 font-plate text-[11px] font-semibold tracking-[0.24em] text-white/50 uppercase">
            {bike.class}
          </p>
          {/* The paragraph where there is one, the one-liner where there is
              not. Measured rather than left to run: at this type size the full
              `max-w-2xl` of the block above would set a line of about
              ninety characters, which is a long way past the point a reader
              starts losing their place returning to the left margin. */}
          {(bike.intro ?? bike.tagline) ? (
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
              {bike.intro ?? bike.tagline}
            </p>
          ) : null}
        </div>

        {/* Bottom-right, and right-aligned within itself so the price and the
            controls share an edge with each other rather than each finding
            their own. Below `sm` it ranges left instead: on a phone the frame
            is narrow enough that a right-aligned block reads as an accident.

            PRICE ABOVE, CONTROLS BELOW. The order was the other way round and
            it put the fine print — a grey sentence — at the very bottom of the
            frame, so the corner the eye lands on last ended on the quietest
            thing in it. Reading down to the buttons now means reading through
            the number first, which is the order the decision is actually made
            in: what it costs, then what to do about it. It also puts the one
            control anybody is going to press closest to the edge of the
            screen. */}
        <div className="flex flex-col items-start gap-7 sm:items-end lg:ml-auto">
          <div className="sm:text-right">
            {/* Was `white/50`. Half-opacity white is a comfortable label tone
                over a dark panel and an unreadable one over a photograph, and
                this label has always been over a photograph. */}
            <p className="font-plate text-[11px] font-semibold tracking-[0.24em] text-white/75 uppercase">
              {bike.priceNpr == null ? 'Price' : 'Starting at'}
            </p>
            <p className="mt-2 font-plate text-3xl font-bold tracking-[0.01em] text-white sm:text-4xl">
              {bike.priceNpr == null ? 'On request' : formatNpr(bike.priceNpr)}
            </p>
            {/* The fine print stays on the body face. Everything above it in
                this cluster is a label or a figure; this is a sentence, and
                Chakra Petch is a face for the first two. */}
            {/* Was `text-xs` at `white/45`, which is the smallest type in the
                frame set at the lowest contrast in it — the one line here that
                could not be read at all. Up a step in both. It stays the
                quietest thing in the cluster; it is now also legible, and those
                were never the same requirement. */}
            <p className="mt-2 text-[13px] text-white/75">
              {bike.priceNpr == null ? 'Ask at the showroom' : 'Ex-showroom, Kathmandu'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/contact"
              className={cn(
                // Outlined, not filled. The solid red button was the only
                // opaque object in the frame and it sat on the brightest part
                // of the road surface, so the eye went to it before the
                // motorcycle. Emptied out, it still reads as the primary
                // control — it is the only bordered thing here — while the
                // photograph runs underneath it.
                'inline-flex items-center gap-2 rounded-full border border-white/70 bg-transparent px-7 py-3.5',
                'font-plate text-[13px] font-semibold tracking-[0.12em] text-white uppercase',
                'transition-colors duration-300',
                EASE,
                // Inverting on hover rather than tinting: a wash of white at
                // low opacity is invisible over a photograph this busy, and
                // the point of a hover state is that it is not in doubt.
                'hover:border-white hover:bg-white hover:text-ink-900',
                'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
              )}
            >
              Book a test ride
              <ArrowRight className="size-3.5" />
            </Link>

            {/* A real anchor, so it survives the JS handler failing and so it
                can be opened in a new tab like any other link. */}
            <a
              href={`#${SPECS_ID}`}
              onClick={toSpecs}
              className={cn(
                'inline-flex items-center px-2 py-3.5 font-plate text-[13px] font-semibold tracking-[0.12em] uppercase',
                'text-white underline decoration-white/30 decoration-1 underline-offset-[9px]',
                'transition-colors duration-300',
                EASE,
                'hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
              )}
            >
              View specs
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
