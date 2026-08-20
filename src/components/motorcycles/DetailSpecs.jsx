/* Hallmark · genre: editorial · tone: technical · macrostructure: Photographic (centre-weighted)
 * theme: project tokens (ink-50 paper · brand-500 accent · Chakra Petch plate + Plus Jakarta Sans)
 * scope: section redesign · enrichment: none (the photograph is the product's own)
 * pre-emit critique: P4 H5 E4 S5 R4 V4
 */

import { useState } from 'react'
import { cn } from '@/utils/cn'

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

/**
 * The second fold of a model's page: the machine, and the three numbers that
 * decide it.
 *
 * The full table of figures is not this section's job — that runs below, and it
 * is a reference a reader consults rather than reads. This one picks the three
 * that decide the purchase and sets them at display size under the bike itself.
 * Everything else is deliberately left out: a column of five specs at this
 * scale stops being a claim and starts being a table with the gridlines
 * missing.
 *
 * ONE COLUMN, AND THE MACHINE IS THE MIDDLE OF IT. The fold used to run type on
 * one side and the photograph on the other, which is the arrangement that made
 * the bike the smaller half of its own section — seven twelfths of the measure,
 * beside a column of type it was competing with rather than being introduced
 * by. Stacked, it takes the width, and everything else in the fold is either
 * the sentence that sets it up or the figures that qualify it.
 *
 * TWO AXES, NOT ONE. The claim and the photograph centre; the paint controls
 * and the figures range left. That is a deliberate break rather than an
 * oversight — centred type over a centred object is a poster, and it is the
 * right register for the largest picture on the page, but a row of controls
 * and a rail of measurements are things to be operated and read, and both want
 * a hard left edge to start from. Centring the whole fold would have made the
 * figures decorative.
 *
 * ONE LINE, AND THE ONLY RED IS THE FULL STOP. The headline is `bike.punch` —
 * six words at most, one sentence — set bold and as large as the measure
 * allows, with its final mark in brand red.
 *
 * Two drafts got here. The first set the whole pitch and broke it onto two
 * lines with the second clause in red, which at that length is not emphasis but
 * a second text colour. The second kept the two lines and moved the red onto
 * the single word the sentence hinged on, chosen in the data — better, and
 * still a paragraph pretending to be a headline.
 *
 * What a model page actually needs here is one statement short enough to take
 * in without moving your eyes, because nobody reads this fold; they scan it and
 * go to the figures. So the copy got shorter rather than the typography getting
 * cleverer, and the colour moved to the one place it can always be honest: the
 * end of the line. Every punch has exactly one full stop, so no writer has to
 * decide which of four words is the hinge, and no regex has to guess.
 *
 * NOTHING HERE IS REQUIRED. A model can reach this page with no tagline, no
 * figures and one colourway, and every block below tests for its own data
 * before it renders. The section itself only appears at all if there is
 * something in it — see the guard in the detail page.
 */

// Which figures may be set at display size, best first. Named here rather than
// taken as the first three of `specs`, because object key order is a property of
// how the data happened to be typed and this is a decision about what matters.
//
// A preference list rather than a fixed three: not every model's sheet carries
// the same measurements — the RVX's quotes charging times where the RV400's
// quotes a pack capacity and a top speed — and a fixed trio would have printed
// a blank cell for whatever a given bike happened not to have. The fold takes
// the first three that exist and the rest go to the table below.
//
// Labels are shorter here than in that table on purpose. This is a headline;
// "Charging time (0–80%)" is a footnote wearing a heading's clothes, and the
// precise wording is one section further down for anyone who needs it.
const HEADLINE_SPECS = [
  { key: 'range', label: 'Range' },
  { key: 'battery', label: 'Battery' },
  { key: 'topSpeed', label: 'Top speed' },
  { key: 'chargeTime', label: 'Charge time' },
  { key: 'fastCharge', label: 'Fast charge' },
]

const HEADLINE_COUNT = 3

/**
 * Split the punch off its full stop, so the stop can be set in red.
 *
 * Returns the sentence and its final mark. A line ending in anything else — or
 * in nothing — comes back whole with an empty mark, and the render simply has
 * no red in it.
 *
 * This is the only place colour touches the headline now. It marks where the
 * line *ends* rather than which word matters, which is a claim the design can
 * always make honestly: every punch line has exactly one full stop, and no
 * writer has to decide which of four words is the hinge.
 */
export function punchParts(line) {
  const match = line.trim().match(/^(.*?)([.!?])$/)
  return match ? [match[1], match[2]] : [line.trim(), '']
}

/**
 * Which of a model's figures this fold sets at display size.
 *
 * Exported because the marquee under this section carries the remainder, and
 * "the remainder" is only meaningful against the same list the rail drew from.
 * Computed in one place so a change to the preference order or the count moves
 * both — the alternative is two components agreeing by coincidence until one of
 * them is edited.
 */
export function headlineSpecKeys(bike) {
  return HEADLINE_SPECS.filter(({ key }) => bike.specs?.[key])
    .slice(0, HEADLINE_COUNT)
    .map(({ key }) => key)
}

export default function DetailSpecs({ bike, id }) {
  // Which colourway is showing. The picker only appears when there is more than
  // one, but the state is unconditional — a bike gaining a second colour should
  // not also be the moment this component starts holding state.
  const [active, setActive] = useState(0)

  const colours = bike.colours ?? []
  const colour = colours[active]
  const specs = headlineSpecKeys(bike).map((key) => HEADLINE_SPECS.find((s) => s.key === key))
  // `punch` first: it is the line written to be set at this size. The pitch and
  // the tagline are fallbacks for a model that has not been given one, and both
  // are full sentences that will wrap — which is survivable, not the intent.
  const headline = bike.punch ?? bike.pitch ?? bike.tagline

  const [punch, stop] = headline ? punchParts(headline) : ['', '']

  // Every colourway is mounted at once and cross-faded between, rather than one
  // <img> having its `src` rewritten. Swapping the source swaps the pixels in a
  // single frame — there is nothing to animate, and on a cold cache the box goes
  // briefly empty while the new file arrives, which reads as a flicker rather
  // than a change of paint.
  //
  // Stacked, the outgoing colour dissolves into the incoming one over the same
  // shape. The bikes are shot in one pose, so nothing appears to move: the
  // machine holds still and only its paint changes, which is exactly what the
  // control claims to do.
  //
  // The cost is three files fetched instead of one, and it is the right trade —
  // they are ~80KB each and the reader is one click away from needing all of
  // them.
  const frames = colours.length > 0 ? colours : [{ name: null, studio: bike.studio }]

  // Whether anything is set above the machine. Two models in the catalogue are
  // still waiting on their copy — no pitch, no tagline, no intro — and the gap
  // that separates a headline from the photograph has no business being there
  // when there is no headline to separate. Left unconditional it read as a
  // section whose first element had failed to load.
  const hasType = Boolean(headline) || Boolean(bike.intro)

  return (
    // The foot was taken off entirely at one point, so the grey closed a hair
    // under the figures. That was right while the next thing down was white —
    // the two grounds are close enough that a deep strip of empty grey read as
    // the section having run out rather than ended.
    //
    // It is wrong now that the marquee sits underneath. Against near-black the
    // join is the hardest edge on the page, and with no clearance the rail's
    // figures sat directly on it: the last line of the fold and the first line
    // of the band became one crowded object. What went back is much less than
    // what came off — enough to let the rule breathe, not so much that the grey
    // trails.
    <section id={id} className="bg-ink-50 pt-8 pb-10 sm:pt-9 sm:pb-12">
      {/* No rule across the top. The grey is edge enough — the section arrives
          straight off a full-bleed black photograph, so the change of ground is
          already the strongest line on the page and a hairline drawn under it
          was a second boundary for a boundary that did not need one. */}
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
        {/* The claim, centred over the machine it introduces and held well
            short of the section's width — at this size a line running the full
            1600px is a banner, and the width belongs to the photograph. */}
        {/* The measure is set by the longest sentence a pitch is likely to hold,
            not by a comfortable reading width. This block is two or three short
            statements, each on its own line — a paragraph measure is the right
            constraint for prose and the wrong one here, because the moment a
            sentence overruns it the line breaks somewhere the writer did not
            choose and the pairing the copy was built on is gone. The RV400's
            "Full-size, full-torque, fully electric." is thirty-nine characters
            and did exactly that at `max-w-3xl`, turning two sentences into
            three lines.

            The intro below keeps its own narrow measure — that one *is* prose,
            and it should not inherit a width set for display type. */}
        {hasType ? (
          <div className="mx-auto max-w-[76rem] text-center">
            {headline ? (
              // One line, bold, and as large as the measure allows.
              //
              // The fold used to set the whole pitch here — two clauses broken
              // onto two lines with the second in red — and it was a paragraph
              // pretending to be a headline. A model page is not read; it is
              // scanned, and what carries at scanning speed is one statement
              // short enough to take in without moving your eyes.
              //
              // Bold rather than the semibold this ran at before: 600 was the
              // right weight for two long lines, where 700 closed the counters
              // into a slab. Four words have room to be heavy.
              //
              // `text-balance` rather than a hard nowrap. These lines fit on
              // one at every width the site supports, but a phone in a large
              // accessibility text size is a width the site does not control,
              // and a headline that overflows the viewport is worse than one
              // that breaks in two.
              <h2 className="font-display text-[clamp(2.25rem,5.6vw,4.5rem)] leading-[1.02] font-bold tracking-[-0.04em] text-ink-900 text-balance [overflow-wrap:anywhere]">
                {punch}
                {stop ? <span className="text-brand-500">{stop}</span> : null}
              </h2>
            ) : null}

            {bike.intro ? (
              <p
                className={cn(
                  'mx-auto max-w-xl text-[15px] leading-[1.7] text-ink-500',
                  headline ? 'mt-6' : null,
                )}
              >
                {bike.intro}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* The machine, at the size the fold is built around. 16:10, not 4:3:
            the bike is shot side-on and is roughly twice as long as it is tall,
            so in a 4:3 box `object-contain` fits it to the width and leaves a
            deep band of empty grey above and below. Ratio fixed so swapping
            colourways cannot resize the frame and shunt the rail below it. */}
        <div
          className={cn(
            'relative mx-auto aspect-16/10 w-full max-w-4xl',
            // The gap belongs to the headline, not to the frame. With no copy
            // above it the machine sits up under the section's own padding
            // instead of a hundred-odd pixels below nothing.
            hasType && 'mt-17 sm:mt-20',
          )}
        >
          {frames.map((option, i) => (
            <img
              key={option.studio}
              src={option.studio}
              // Only the colour on show is described. The other two are the same
              // motorcycle and would have a screen reader read the bike out
              // three times over for one photograph.
              alt={
                i === active
                  ? option.name
                    ? `${bike.name} in ${option.name}`
                    : `${bike.name}, ${bike.class}`
                  : ''
              }
              aria-hidden={i === active ? undefined : 'true'}
              loading="lazy"
              className={cn(
                'absolute inset-0 size-full object-contain',
                'transition-[opacity,transform] duration-500',
                EASE,
                // The incoming colour settles the last fraction of a percent
                // into place as it arrives. Too small to read as a zoom, big
                // enough that the dissolve has a direction.
                i === active ? 'scale-100 opacity-100' : 'scale-[1.015] opacity-0',
              )}
            />
          ))}
        </div>

        {/* Discs and name on one line, hard to the left edge of the section —
            the same edge the first cell of the rail below opens on.

            Labelled again, and this time with an instruction rather than a
            description. "Explore colourways" was a caption on a control that
            explains itself; "Pick your colour" tells a reader the row is theirs
            to press, which a row of discs under a photograph does not otherwise
            say — nothing about a coloured circle announces that it is a button.

            Only above a real choice. Over the single sample a one-colour model
            gets, an instruction to pick invites a press that cannot change
            anything, which is the same reason that sample is not a button. */}
        {colour ? (
          <div className="mt-7">
            {colours.length > 1 ? (
              <p className="mb-3.5 font-plate text-[11px] font-semibold tracking-[0.24em] text-ink-500 uppercase">
                Pick your colour
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {colours.length > 1 ? (
                colours.map((option, i) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                    // The name is the accessible label. Without it the control
                    // announces as an empty button, since everything visible
                    // about it is colour.
                    aria-label={option.name}
                    title={option.name}
                    className={cn(
                      'size-8 rounded-full border transition-[border-color,transform] duration-300',
                      EASE,
                      'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500',
                      i === active
                        ? 'scale-110 border-ink-900'
                        : 'border-ink-900/20 hover:border-ink-900/50',
                    )}
                    // Two-tone, split across the middle: these bikes are painted
                    // in pairs and a single flat disc would make "Eclipse Red"
                    // and "Meteor Red" the same swatch.
                    style={{
                      backgroundImage: `linear-gradient(to bottom, ${option.swatch[0]} 50%, ${option.swatch[1]} 50%)`,
                    }}
                  />
                ))
              ) : (
                // A single colour is not a choice, so it is not offered as one —
                // it is a sample, and a sample is not a button. Rendering the
                // disabled control was the old answer and it still put a
                // pressable-looking object on the page that could not be pressed.
                <span
                  aria-hidden="true"
                  className="size-8 rounded-full border border-ink-900/20"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, ${colour.swatch[0]} 50%, ${colour.swatch[1]} 50%)`,
                  }}
                />
              )}

              {/* Keyed on the name so React replaces the node rather than editing
                its text, which is what replays `rise` — the same re-entry the
                lineup selector uses when its figures swap. On the plate face
                and tracked out: with the discs beside it, this is a readout on
                a control rather than a caption under a picture. */}
              <p
                key={colour.name}
                className="animate-rise font-plate text-[11px] font-semibold tracking-[0.24em] text-ink-800 uppercase"
              >
                {colour.name}
              </p>
            </div>
          </div>
        ) : null}

        {/* The figures, across the foot of the fold. Cells divided by rules
            rather than rows separated by them — read across, three measurements
            are a cluster of gauges; read down, the same three are the table that
            runs one section below, which is where a reader who wants to compare
            numbers is going anyway.

            Heavier rule on top than between: the line above closes the
            photograph and opens the rail, so it carries the section's weight,
            while the dividers inside only need to separate one figure from the
            next. Two rules of the same strength would have made the whole thing
            a grid.

            `tabular-nums` because these are columns of figures in everything but
            name — proportional digits set three cells of numerals that do not
            line up with each other. */}
        {specs.length > 0 ? (
          <dl className="mt-8 flex flex-col border-t border-ink-900 sm:mt-9 sm:flex-row">
            {specs.map(({ key, label }, i) => (
              <div
                key={key}
                className={cn(
                  // Centred in the cell rather than ranged to its left edge.
                  // Left-ranged, each figure hung off its own divider and the
                  // trailing space fell to the right of it, so three cells of
                  // unequal word-lengths read as three ragged blocks rather than
                  // as one instrument row. Centred, the dividers space evenly
                  // against the figures either side of them.
                  //
                  // No asymmetric padding once centred: the `pl-8` that pushed
                  // each figure off its divider is what would put the centre of
                  // the cell 16px right of the centre of its share of the rail.
                  'flex-1 px-4 py-5 text-center sm:py-6',
                  i > 0 && 'border-t border-ink-900/15 sm:border-t-0 sm:border-l',
                )}
              >
                {/* Plate face, tracked out, grey — the same label the hero sets
                    over the price one fold up. The figure below is the
                    statement; this is what it measures, and the two should not
                    compete for the same weight. */}
                <dt className="font-plate text-[11px] font-semibold tracking-[0.24em] text-ink-500 uppercase">
                  {label}
                </dt>
                {/* Bolder than bold. Chakra Petch stops at 700, so `font-bold`
                    is already the heaviest weight the face has and there is no
                    800 to reach for — the stroke thickens the glyphs from their
                    own outline instead, which is the only way to add weight
                    without changing the family. Sized in a fraction of a pixel
                    and drawn in `currentColor` so it reads as a heavier cut
                    rather than as an outline around the numerals. */}
                <dd className="mt-2.5 font-plate text-[clamp(1.5rem,2.3vw,2.125rem)] leading-none font-bold tracking-[0.01em] text-ink-900 tabular-nums uppercase [-webkit-text-stroke:0.7px_currentColor] [overflow-wrap:anywhere]">
                  {bike.specs[key]}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  )
}
