import { SPEC_LABELS } from '@/data/motorcycles'

/**
 * The reference sheet at the foot of a model's page, set as a blueprint.
 *
 * ARCHETYPE: SWISS INDUSTRIAL PRINT, and only that one. The alternative register
 * — dark tactical telemetry, phosphor on near-black — was rejected on sight: the
 * page arrives here off a white band, the studio cutouts above are shot on
 * white, and a black terminal panel dropped between them would read as a widget
 * borrowed from another site rather than as the last section of this one. Light
 * substrate, carbon ink, hazard red, ninety-degree corners throughout.
 *
 * WHY IT IS A GRID AND NOT A LIST. The block this replaces set eleven
 * measurements as loose `dt`/`dd` pairs on an open white page, three to a row,
 * with nothing drawn between them. Read quickly it was a paragraph of numbers:
 * no cell had an edge, so the eye had to work out for itself where "5 years or
 * 60,000 km" stopped and "8 years or 80,000 km" started. Ruled into a table
 * every figure is compartmentalised, and the sheet reads as what it is — a
 * specification, consulted rather than read.
 *
 * RULES DRAWN ON THE CELLS, NOT BY THE GAP. The usual trick for a razor-thin
 * grid is `gap: 1px` over a dark parent, and it is the wrong one here. The
 * parent's ground fills the *whole* grid box, including the tracks left empty
 * when the last row is short — a model quoting five figures into a four-column
 * grid would print three cells of solid black at the bottom of its own spec
 * sheet. Each cell carrying its own right and bottom rule survives any count at
 * any breakpoint, and a partial last row simply stops, which on a technical
 * drawing reads as deliberate.
 *
 * NOTHING INVENTED IN THE FURNITURE. Industrial layouts of this kind are
 * usually dressed with revision numbers, unit IDs and coordinate strings. Every
 * one of those would be a fabricated fact printed in the same typeface, at the
 * same size, and with the same authority as the warranty terms directly beneath
 * it. The header carries the two things that are true — the model and its class
 * — plus the bracket and registration marks, which are punctuation rather than
 * claims.
 *
 * DEVIATIONS FROM THE ARCHETYPE, ON PURPOSE:
 *
 * - No monospace. The reference register wants a mono for all micro-type, and
 *   adding one would make this the site's third family for the sake of a single
 *   section. Chakra Petch is already the page's technical voice — squared,
 *   close-fitting, and used for every label and figure in the two folds above —
 *   so the band and the rail and this sheet stay in one language.
 * - Tracking on the macro header is `-0.015em`, not the `-0.03em` to `-0.06em`
 *   the register calls for. Those figures assume a neo-grotesque with room to
 *   give; Chakra Petch is drawn tight already and closing it further runs the
 *   glyphs into each other at display size.
 * - No scanlines, halftone or global grain. The section is small type on white,
 *   and a noise filter over an eleven-cell table of measurements costs
 *   legibility to buy texture. The site's `grain` utility stays where it earns
 *   its keep, on the dark photographic bands.
 */

export default function DetailFigures({ bike }) {
  const specs = Object.entries(bike.specs ?? {})
  const highlights = bike.highlights ?? []

  return (
    <section className="bg-white pt-14 pb-20 sm:pt-16 sm:pb-24">
      {/* Aligned to the spec fold above rather than to the narrower wrapper the
          rest of the site's sections use. The rail two folds up opens on this
          same left edge, and a technical drawing that does not line up with the
          one above it is a drawing nobody trusts. */}
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        {/* The hazard bar. Solid red, full measure, no radius — the one piece of
            colour above the fold's own accent, and the thing that says a
            different kind of information starts here. */}
        <div aria-hidden="true" className="h-1.5 w-full bg-brand-500" />

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-ink-900 pb-3">
          <p className="font-plate text-[11px] font-bold tracking-[0.26em] text-ink-900 uppercase">
            [ Specification ]
          </p>
          {/* Both halves are facts the catalogue already holds. The registration
              mark is a structural glyph closing the line, not a legal claim
              about the model name. */}
          <p className="font-plate text-[11px] font-semibold tracking-[0.26em] text-ink-500 uppercase">
            {bike.name} / {bike.class} <span className="text-ink-900">®</span>
          </p>
        </div>

        {/* Macro type, compressed and uppercase, on one line. It was broken
            after the model name — an architectural block of two stacked words —
            and read as two things rather than as the phrase it is. Set as a
            single line it is a caption on the table beneath it, which is what
            it says.

            The ceiling comes down from 8rem to 6rem to pay for the width: the
            same words that fitted a two-line block at display size run about
            fourteen characters across on one, and a model with a longer name
            has to clear the measure too. `nowrap` up to `sm` only — on a phone a
            long name is allowed to break rather than shrink to nothing.

            The stroke is the same device the figures use: Chakra Petch stops at
            700 and there is no heavier cut to reach for, so the glyphs are
            thickened from their own outline. */}
        <h2 className="mt-8 font-plate text-[clamp(1.875rem,6.4vw,6rem)] leading-[0.95] font-bold tracking-[-0.015em] text-ink-900 uppercase [-webkit-text-stroke:1px_currentColor] [overflow-wrap:anywhere] sm:mt-10 sm:whitespace-nowrap">
          {bike.name} in figures
        </h2>

        {specs.length > 0 ? (
          // Top and left drawn on the table, right and bottom on every cell:
          // together they close a full row exactly once and leave a short last
          // row open at its end.
          <dl className="mt-10 grid grid-cols-2 border-t border-l border-ink-900 sm:mt-12 lg:grid-cols-4">
            {specs.map(([key, value]) => (
              <div
                key={key}
                className="border-r border-b border-ink-900 px-5 py-6 sm:px-6 sm:py-7"
              >
                <dt className="font-plate text-[10px] font-semibold tracking-[0.24em] text-ink-500 uppercase">
                  {SPEC_LABELS[key] ?? key}
                </dt>
                {/* `tabular-nums` because the cells sit in columns and the
                    figures in them should agree on the width of a digit — "8
                    years or 80,000 km" above "5 years or 60,000 km" reads as a
                    pair only if the numerals line up. */}
                <dd className="mt-3 font-plate text-[clamp(1.0625rem,1.5vw,1.375rem)] leading-[1.15] font-bold tracking-[0.01em] text-ink-900 tabular-nums uppercase [overflow-wrap:anywhere]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {/* What the machine carries, as against what it measures. Two columns,
            because the list runs to eleven items on a fully-specified model and
            a single file of eleven short phrases is a column of ragged
            right-hand edges with a great deal of white beside it.

            Ruled cell by cell for the same reason the table above is: eleven
            items across two columns leaves one track empty on the last row, and
            under the `gap-px` idiom that empty track is where the dark parent
            shows through as a block. */}
        {highlights.length > 0 ? (
          <ul className="mt-10 grid border-t border-l border-ink-900 sm:mt-12 sm:grid-cols-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-baseline gap-4 border-r border-b border-ink-900 px-5 py-4 sm:px-6"
              >
                {/* Directional rather than a bullet. A list of what a machine
                    does wants a mark that points forward. */}
                <span
                  aria-hidden="true"
                  className="shrink-0 font-plate text-[12px] font-bold tracking-[0.1em] text-brand-500"
                >
                  ///
                </span>
                <span className="text-[15px] leading-[1.5] text-ink-800">{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

      </div>
    </section>
  )
}
