import Container from '@/components/ui/Container'
import { useMounted } from '@/hooks/useReveal'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { BOARD, MANAGEMENT, PRINCIPLES } from '@/data/leadership'
import { cn } from '@/utils/cn'

/**
 * Leadership, in two tiers: the board that signs for the group, then the
 * management team that runs the distributorship.
 *
 * The two are set differently on purpose, because they answer different
 * questions. The board is who you are dealing with — four people, portraits, a
 * plate each. The management team is who you reach — six people, ruled rows,
 * and the thing worth reading is the remit rather than the face.
 *
 * Portraits are not supplied yet. Rather than leave the board as a wall of grey
 * boxes or defer the band entirely, every plate renders a marked placeholder at
 * the exact aspect the photograph will occupy: hatched paper, the monogram, and
 * a line saying the portrait is to come. The layout it ships with is the layout
 * it keeps — see [[Portrait]].
 *
 *   1. Masthead — the rule-flanked label, the claim, one standfirst, and a
 *      ruled ledger on the bottom edge. About's masthead, set on this page.
 *   2. The board — four portrait plates on the paper, captioned below.
 *   3. The management team — six ruled rows on the tinted band.
 *   4. What that means — three ruled principles, numbered.
 *
 * No closing CTA. The page is a reference — who these people are — and the ask
 * is on every other page and in the footer of this one.
 *
 * DATA STATUS — the four board names and titles are real; the management names
 * are stand-ins and no remit line is approved. See `data/leadership.js`.
 */

const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const LABEL = 'text-[11px] font-semibold tracking-[0.2em] uppercase'

/** Initials for the placeholder plate. Two letters — three reads as an acronym. */
const monogram = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

export default function Leadership() {
  const mounted = useMounted()

  const boardRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.08 })
  const managementRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.06 })
  const principlesRef = useScrollReveal({ y: 16, duration: 0.7, stagger: 0.07 })

  // Same helper the About masthead uses: the delay is a value, not a token, and
  // it drops to zero on the way out so a stagger never plays backwards.
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
      {/* ── The masthead ──────────────────────────────────────────────────
          About's masthead, set on this page — deliberately the same object
          rather than a variation on it. Rule-flanked label, the claim centred
          at masthead scale, one standfirst, and the ledger sitting on the
          bottom edge of the first screen with the viewport's leftover height
          absorbed between them.

          The two pages are a pair: About is the operation, this is the people
          in it, and a reader arriving at the second from the first should
          recognise the page before they read a word of it. Every attempt to
          make this opening its own thing — a flush-left title block, a ghost
          nameplate behind the claim — made the pair look like two sites. */}
      <section className="flex min-h-[calc(100svh-6rem)] flex-col pt-24 pb-12 sm:pt-28 sm:pb-14">
        <Container className="flex max-w-[92rem] flex-1 flex-col">
          <div {...enter(mounted, 0, 'flex items-center gap-5')}>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'shrink-0 text-brand-600')}>Leadership</p>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
          </div>

          <h1
            {...enter(
              mounted,
              60,
              'mx-auto mt-4 max-w-[18ch] text-center font-display text-[clamp(2.5rem,7vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.045em] text-ink-900 text-balance sm:mt-5',
            )}
          >
            Who signs for it, and who <span className="text-brand-600">runs</span> it.
          </h1>

          <p
            {...enter(
              mounted,
              140,
              'mx-auto mt-8 max-w-[52ch] text-center text-[15.5px] leading-relaxed text-ink-500 text-pretty sm:mt-9',
            )}
          >
            A board of four and a team of six — the whole operation in Nepal. No department to be
            escalated to: every job below has one name against it, and precisely what lands on that
            desk when something goes wrong.
          </p>

          {/* Absorbs whatever height the viewport has left, so the ledger
              closes the first screen instead of trailing the copy. */}
          <div aria-hidden="true" className="hidden lg:block lg:flex-1" />

          {/* ── The ledger ────────────────────────────────────────────────
              Three figures, ruled, on the bottom edge — the shape of the page
              stated as numbers before either roster is read. The two counts are
              taken off `data/leadership.js`, so they cannot drift from the
              rosters below. Equal cells, because they are the same kind of fact
              at the same weight. */}
          <dl
            {...enter(
              mounted,
              160,
              cn(
                'mt-14 grid border-y border-ink-900/12 sm:mt-16 sm:grid-cols-3',
                '[&>div]:border-t [&>div]:border-ink-900/12 [&>div]:first:border-t-0',
                'sm:[&>div]:border-t-0 sm:[&>div]:border-l sm:[&>div]:first:border-l-0',
                '[&>div]:py-6 [&>div]:text-center sm:[&>div]:px-8 lg:[&>div]:py-7',
              ),
            )}
          >
            {[
              { term: 'Board of directors', value: String(BOARD.length).padStart(2, '0') },
              { term: 'Management team', value: String(MANAGEMENT.length).padStart(2, '0') },
              { term: 'Distributor since', value: '2023' },
            ].map((row) => (
              <div key={row.term}>
                <dt className={cn(LABEL, 'text-ink-500')}>{row.term}</dt>
                <dd className="mt-4 font-display text-[2rem] leading-none font-extrabold tracking-[-0.04em] text-ink-900 tabular-nums sm:text-[2.5rem]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── The board ─────────────────────────────────────────────────────
          Four plates on the paper. Captions sit under the portrait rather than
          over it: a caption knocked out of the bottom of a photograph needs the
          photograph to be dark exactly there, which is a bet on four images
          that do not exist yet — and it would leave the placeholder state with
          white type on hatched paper. Under the plate it reads the same either
          way, and it is ruled, which the rest of the site is. */}
      <section id="board" ref={boardRef} className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
        <Container className="max-w-[92rem]">
          <div data-reveal className="flex items-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'text-brand-600')}>Board of directors</p>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'hidden shrink-0 text-ink-900/35 tabular-nums sm:block')}>
              01 — {String(BOARD.length).padStart(2, '0')}
            </p>
          </div>

          <ul className="mt-12 grid gap-x-6 gap-y-12 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
            {BOARD.map((person, index) => {
              return (
                <li key={person.slug} id={person.slug} data-reveal className="group scroll-mt-28">
                  <Portrait person={person} />

                  {/* The rule under the plate is the caption's top edge, and it
                      turns red as the whole cell is pointed at — the one place
                      the board band moves. */}
                  <div
                    className={cn(
                      'mt-5 border-t-2 border-ink-900/12 pt-4',
                      'transition-colors duration-500',
                      EASE,
                      'group-hover:border-brand-500',
                    )}
                  >
                    {/* The index sits on the caption rule rather than over the
                        plate: a numeral on the image has to be legible against
                        a photograph that does not exist yet *and* against light
                        hatched paper, and nothing is both. */}
                    <div className="flex items-baseline justify-between gap-4">
                      <p className={cn(LABEL, 'text-brand-600')}>{person.role}</p>
                      <p aria-hidden="true" className={cn(LABEL, 'text-ink-900/25 tabular-nums')}>
                        {String(index + 1).padStart(2, '0')}
                      </p>
                    </div>

                    {/* One line. Four people share the surname, so it was set
                        under the given names to put the part that differs on
                        its own line — but the name is read as a name, and
                        breaking it made the plates look like four entries for
                        the same person. The size is clamped to the narrowest
                        cell so the longest of the four still sets flat. */}
                    <h3 className="mt-3 font-display text-[clamp(1.25rem,1.7vw,1.5rem)] leading-[1.15] font-extrabold tracking-[-0.03em] text-ink-900">
                      {person.name}
                    </h3>
                  </div>
                </li>
              )
            })}
          </ul>
        </Container>
      </section>

      {/* ── The management team ───────────────────────────────────────────
          Rows, not plates. Six equal tiles would set the remit — the only thing
          on this band worth reading — as small print inside a box; a row gives
          it a column of its own at the size the rest of the site sets body
          copy. The whole row fills to ink on hover. */}
      <section
        id="management"
        ref={managementRef}
        className="scroll-mt-24 border-y border-ink-900/[0.07] bg-ink-50 py-16 sm:py-20 lg:py-24"
      >
        <Container className="max-w-[92rem]">
          <div data-reveal className="flex items-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'text-brand-600')}>Management team</p>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'hidden shrink-0 text-ink-900/35 tabular-nums sm:block')}>
              01 — {String(MANAGEMENT.length).padStart(2, '0')}
            </p>
          </div>

          <ul className="mt-12 border-b border-ink-900/12 sm:mt-14">
            {MANAGEMENT.map((person, index) => (
              <li
                key={person.slug}
                id={person.slug}
                data-reveal
                className="group scroll-mt-28 border-t border-ink-900/12"
              >
                <div
                  className={cn(
                    'grid items-start gap-5 px-3 py-8 sm:px-6 lg:py-10',
                    'lg:grid-cols-[3rem_5.5rem_1fr_1.15fr] lg:items-center lg:gap-8',
                    'transition-colors duration-500',
                    EASE,
                    'group-hover:bg-ink-900',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'font-display text-sm font-bold tabular-nums text-ink-900/25',
                      'transition-colors duration-500',
                      EASE,
                      'group-hover:text-brand-500',
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <Portrait person={person} variant="chip" />

                  <div>
                    <h3
                      className={cn(
                        'font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.05] font-extrabold tracking-[-0.035em] text-ink-900',
                        'transition-colors duration-500',
                        EASE,
                        'group-hover:text-white',
                      )}
                    >
                      {person.name}
                    </h3>
                    <p
                      className={cn(
                        LABEL,
                        'mt-3 text-brand-600 transition-colors duration-500',
                        EASE,
                        'group-hover:text-brand-500',
                      )}
                    >
                      {person.role}
                    </p>
                  </div>

                  <div>
                    <p
                      className={cn(
                        'max-w-[46ch] text-[16px] leading-[1.7] text-ink-800 text-pretty sm:text-[17px]',
                        'transition-colors duration-500',
                        EASE,
                        'group-hover:text-white/70',
                      )}
                    >
                      {person.remit}
                    </p>
                    <p
                      className={cn(
                        LABEL,
                        'mt-4 text-ink-500 transition-colors duration-500',
                        EASE,
                        'group-hover:text-white/40',
                      )}
                    >
                      In post since {person.since}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── What that means ───────────────────────────────────────────────
          Three, numbered and ruled. Equal cells, because these are the same
          kind of claim at the same weight — the one case for equal columns. */}
      <section ref={principlesRef} className="py-16 sm:py-20 lg:py-24">
        <Container className="max-w-[92rem]">
          <div data-reveal className="flex items-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
            <p className={cn(LABEL, 'text-brand-600')}>What that means for you</p>
            <span aria-hidden="true" className="h-px flex-1 bg-ink-900/12" />
          </div>

          <div
            className={cn(
              'mt-12 grid border-y border-ink-900/12 sm:mt-14 lg:grid-cols-3',
              '[&>div]:border-t [&>div]:border-ink-900/12 [&>div]:first:border-t-0',
              'lg:[&>div]:border-t-0 lg:[&>div]:border-l lg:[&>div]:first:border-l-0',
              '[&>div]:py-8 lg:[&>div]:px-8 lg:[&>div]:py-10 lg:[&>div]:first:pl-0',
            )}
          >
            {PRINCIPLES.map((principle, index) => (
              <div key={principle.title} data-reveal>
                <p className={cn(LABEL, 'text-brand-600 tabular-nums')}>
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-6 font-display text-[1.5rem] leading-[1.1] font-extrabold tracking-[-0.03em] text-ink-900 sm:text-[1.75rem]">
                  {principle.title}
                </h3>
                <p className="mt-4 max-w-[38ch] text-[16px] leading-[1.75] text-ink-500 text-pretty">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}

// Paper tooth for the empty plate: a hairline diagonal hatch, low enough in
// contrast to read as ruled stock rather than as a pattern. It is what tells a
// reader the box is a reserved slot and not a photograph that failed to load.
const HATCH = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(18,18,20,0.055) 0 1px, transparent 1px 9px)',
}

/**
 * A person's portrait, or the slot one will occupy.
 *
 * Two variants, one aspect discipline: `plate` is the board's 3:4 portrait,
 * `chip` is the square the management row carries. Both render the photograph
 * when `person.photo` is set and a marked placeholder when it is not, at
 * identical dimensions — so dropping the files in later changes what is inside
 * the box and nothing about the page around it.
 *
 * `object-top` on the image, not `object-center`: a head-and-shoulders frame
 * cropped to 3:4 from the centre takes the chin off.
 */
function Portrait({ person, variant = 'plate' }) {
  const plate = variant === 'plate'

  const frame = plate
    ? 'aspect-[3/4] w-full'
    : 'size-16 shrink-0 sm:size-[5.5rem]'

  if (person.photo) {
    return (
      <div className={cn('overflow-hidden bg-ink-50 ring-1 ring-ink-900/10', frame)}>
        <img
          src={person.photo}
          alt={person.name}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover object-top',
            plate && 'transition-transform duration-700 group-hover:scale-[1.03]',
            EASE,
          )}
        />
      </div>
    )
  }

  return (
    <div
      role="img"
      aria-label={`Portrait of ${person.name} to come`}
      style={HATCH}
      className={cn(
        'relative grid place-items-center bg-ink-50 ring-1 ring-ink-900/12',
        frame,
        // Only the row inverts, so only the chip needs to survive it.
        !plate && 'transition-colors duration-500 group-hover:bg-transparent group-hover:ring-white/25',
        EASE,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'font-display font-extrabold tracking-[-0.03em] text-ink-900/25',
          plate ? 'text-[clamp(2rem,4vw,3rem)]' : 'text-[20px] sm:text-[26px]',
          !plate && 'transition-colors duration-500 group-hover:text-white/60',
          EASE,
        )}
      >
        {monogram(person.name)}
      </span>

      {/* Named as pending only on the board plate. On the row's 64px chip there
          is no room for the line, and the monogram already reads as a stand-in
          at that size. */}
      {plate && (
        <span
          aria-hidden="true"
          className={cn(LABEL, 'absolute bottom-4 text-[10px] text-ink-900/30')}
        >
          Portrait to come
        </span>
      )}
    </div>
  )
}
