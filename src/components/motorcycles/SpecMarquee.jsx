import { useMediaQuery } from '@/hooks/useMediaQuery'
import { headlineSpecKeys } from '@/components/motorcycles/DetailSpecs'
import { SPEC_LABELS } from '@/data/motorcycles'
import { cn } from '@/utils/cn'

/**
 * A running band of the model's remaining measurements, under the spec fold.
 *
 * WHAT IT CARRIES, AND WHY IT IS NOT INVENTED. The rail in the fold above sets
 * three figures at display size; this takes every other measurement the model
 * actually quotes and runs them past. Nothing here is written for the strip —
 * each item is a key and a value out of `bike.specs`, worded by the same
 * `SPEC_LABELS` dictionary the table at the foot of the page uses. A model with
 * nothing left over renders no band at all rather than a band of filler.
 *
 * NO ICONS. The reference this was built against sets a glyph beside every item.
 * The site's icon set is arrows, a bolt, a clock and a few contact marks — there
 * is no honest glyph in it for "seat height" or "reverse mode", and reaching for
 * the nearest-looking one is how a page ends up with a telephone next to a
 * warranty. The band is typographic and the red lozenge between items is a
 * separator, not a symbol.
 *
 * SPECS ONLY, NOT HIGHLIGHTS. A model's `highlights` are sentences, and a
 * sentence set in the plate face at marquee size is either shouting or a
 * different voice from the item beside it. They are also already printed, as a
 * list, one section below. The band keeps one register: label, then figure.
 *
 * DARK, BETWEEN TWO LIGHT BANDS. The fold above closes flush on its rail and the
 * section below opens on white, so a strip of near-black between them is what
 * stops the two from reading as one long light stretch. It is also the same
 * ground the hero uses, which is what makes it read as part of the page's
 * rhythm rather than as a widget dropped in.
 */

// How many items the running half should hold before it repeats. The keyframe
// travels exactly half the track, so the two halves must be identical and each
// one must be wider than the widest viewport it will run on — with three or
// four measurements to its name a model would otherwise show a band, then a gap
// the width of the screen, then the band again. Short lists are repeated within
// the half until they are long enough; the loop stays seamless either way.
const MIN_PER_HALF = 8

export default function SpecMarquee({ bike }) {
  // The band moves on its own and cannot be stopped by a reader who finds that
  // difficult to read past, so under `prefers-reduced-motion` it does not move
  // at all — it becomes a strip they scroll themselves. Read during the first
  // render rather than in an effect, so the still version paints still rather
  // than starting to travel and then stopping.
  const still = useMediaQuery('(prefers-reduced-motion: reduce)')

  const taken = new Set(headlineSpecKeys(bike))
  const items = Object.entries(bike.specs ?? {})
    .filter(([key]) => !taken.has(key))
    .map(([key, value]) => ({ key, label: SPEC_LABELS[key] ?? key, value }))

  // Nothing left over means nothing to say. A model whose whole sheet fits in
  // the rail above gets no band, rather than a band repeating the rail.
  if (items.length === 0) return null

  const reps = Math.max(1, Math.ceil(MIN_PER_HALF / items.length))
  const half = Array.from({ length: reps }, () => items).flat()

  return (
    <section className="overflow-hidden bg-ink-950" aria-label={`${bike.name} — further specification`}>
      {/* Paused while a pointer is over it or anything inside it has focus.
          Auto-moving content that runs longer than five seconds needs a way to
          stop, and hover plus focus-within covers both the reader who wants to
          finish reading an item and the one arriving by keyboard. */}
      <div
        className={cn(
          'flex w-max',
          !still && 'animate-marquee hover:[animation-play-state:paused]',
          !still && 'focus-within:[animation-play-state:paused]',
          // Nothing to loop when it is not moving: the single half is left to
          // overrun its box and the reader pushes it along. `touch-pan-x` so a
          // horizontal drag scrolls the strip instead of being claimed by the
          // page's own vertical scroll.
          still && 'w-full touch-pan-x snap-x overflow-x-auto',
        )}
      >
        {/* Two identical halves, and only the first is read out. The second
            exists so that the moment the first has travelled its own width the
            same content is already sitting where it started — remove it and the
            band jumps at the end of every cycle. To a screen reader it is the
            same list twice, which is why it is hidden. */}
        {(still ? [0] : [0, 1]).map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? 'true' : undefined}
            className="flex shrink-0 items-center"
          >
            {half.map((item, i) => (
              <li
                key={`${item.key}-${i}`}
                className="flex shrink-0 items-center gap-3.5 py-5 pr-7 pl-0 sm:gap-4 sm:pr-9"
              >
                {/* The separator, and the one piece of colour in the band. A
                    lozenge rather than a bullet because a round dot at this
                    size reads as a full stop between two phrases; turned on its
                    corner it reads as a mark dividing them. */}
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rotate-45 bg-brand-500"
                />
                <span className="font-plate text-[11px] font-semibold tracking-[0.24em] whitespace-nowrap text-white/45 uppercase">
                  {item.label}
                </span>
                {/* The figure in the plate face, as everywhere else on this page
                    that sets a measurement. `tabular-nums` so the numerals hold
                    their width as the band moves — proportional digits make a
                    figure appear to breathe while it travels. */}
                <span className="font-plate text-[15px] font-bold tracking-[0.02em] whitespace-nowrap text-white tabular-nums uppercase">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
